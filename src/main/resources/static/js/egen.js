import { WASI, Fd, File, OpenFile } from "https://cdn.jsdelivr.net/npm/@bjorn3/browser_wasi_shim@0.3.0/+esm";

export const DataFormat = {
    PLAIN_TEXT: 0
};

export const SequenceMode = {
    UNDEFINED: 0,
    DNA: 1 << 5,
    RNA: 1 << 6
};

export const SequenceClass = {
    UNDEFINED: 0,
    HUMAN: 1,
    VIRUS: 2 // or incomplete
};

export const AnomalyType = {
    INVALID_INPUT: 0,
    START: 1,
    END: 2,
    EARLY_AMBER: 3,
    EARLY_UMBER: 4,
    EARLY_OCHRE: 5,
    ALIGNMENT: 6,
    ABNORMAL_GAC: 7
};

export const DefaultPlainSettings = {
    capitalise: true,
    codoneSplit: '-',
    groupSplit: ' ',
    groupSize: 15,
    lineSplit: '\n',
    lineSize: 60,
    rna: false
};

export class LibEgen {
    constructor(wasmInstance) {
        this.exports = wasmInstance.exports;
        this.memory = this.exports.memory;
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
    }

    _allocString(str) {
        const bytes = this.encoder.encode(str);
        const ptr = this.exports.wasm_malloc(bytes.length);
        new Uint8Array(this.memory.buffer).set(bytes, ptr);
        return { ptr, size: bytes.length };
    }

    _allocBytes(uint8Array) {
        const ptr = this.exports.wasm_malloc(uint8Array.length);
        new Uint8Array(this.memory.buffer).set(uint8Array, ptr);
        return { ptr, size: uint8Array.length };
    }

    _extractAnomalies(statePtr) {
        const count = this.exports.wasm_get_anomalies_count(statePtr);
        const anomalies =[];

        for (let i = 0; i < count; i++) {
            const type = this.exports.wasm_get_anomaly_type(statePtr, i);
            const anomaly = { type };

            switch (type) {
                case AnomalyType.INVALID_INPUT:
                    anomaly.position = this.exports.wasm_get_anomaly_position(statePtr, i);
                    anomaly.char = String.fromCharCode(this.exports.wasm_get_anomaly_char(statePtr, i));
                    break;
                case AnomalyType.EARLY_AMBER:
                case AnomalyType.EARLY_UMBER:
                case AnomalyType.EARLY_OCHRE:
                    anomaly.position = this.exports.wasm_get_anomaly_position(statePtr, i);
                    break;
                case AnomalyType.ABNORMAL_GAC:
                    anomaly.position = this.exports.wasm_get_anomaly_position(statePtr, i);
                    anomaly.count = this.exports.wasm_get_anomaly_gac_count(statePtr, i);
                    break;
            }
            anomalies.push(anomaly);
        }
        return anomalies;
    }

    _extractState(statePtr) {
        return {
            bytesCount: this.exports.wasm_get_bytes_count(statePtr),
            nucleotidesCount: this.exports.wasm_get_nucleotides_count(statePtr),
            mode: this.exports.wasm_get_mode(statePtr),
            klass: this.exports.wasm_get_klass(statePtr),
            anomalies: this._extractAnomalies(statePtr)
        };
    }

    processSequence(sequenceStr, format = DataFormat.PLAIN_TEXT) {
        const stream = this.createStream();
        try {
            stream.process(sequenceStr, format);
            stream.end();
            return stream.getResults();
        } finally {
            stream.free();
        }
    }

    createStream() {
        return new EgenStream(this);
    }

    plainToNucleotides(plainTextStr) {
        const { ptr: inPtr, size: inSize } = this._allocString(plainTextStr);
        
        const outPtr = this.exports.wasm_plain2nucleotides(inPtr, inSize);
        const outSize = this.exports.wasm_get_last_out_size();
        const result = new Uint8Array(this.memory.buffer, outPtr, outSize).slice();
        this.exports.wasm_free(inPtr);
        if (outPtr) {
			this.exports.wasm_free(outPtr);
		}
        return result;
    }

    nucleotidesToPlain(nucleotidesArray, settings = {}) {
        const { ptr: inPtr, size: inSize } = this._allocBytes(nucleotidesArray);
        const s = { ...DefaultPlainSettings, ...settings };
        const charCode = (char) => (char && char.length > 0) ? char.charCodeAt(0) : 0;

        const outPtr = this.exports.wasm_nucleotides2plain(
            inPtr, inSize,
            s.capitalise, charCode(s.codoneSplit), charCode(s.groupSplit),
            s.groupSize, charCode(s.lineSplit), s.lineSize, s.rna
        );
        const outSize = this.exports.wasm_get_last_out_size();

        const resultBuffer = new Uint8Array(this.memory.buffer, outPtr, outSize);
        const resultStr = this.decoder.decode(resultBuffer);
        this.exports.wasm_free(inPtr);
        if (outPtr) this.exports.wasm_free(outPtr);
        return resultStr;
    }
}

export class EgenStream {
    constructor(lib) {
        this.lib = lib;
        this.statePtr = this.lib.exports.wasm_stream_state_create();
        this.isFreed = false;
    }

    process(blockStr, format = DataFormat.PLAIN_TEXT) {
        if (this.isFreed) throw new Error("Cannot process: Stream already freed.");
        const { ptr, size } = this.lib._allocString(blockStr);
        this.lib.exports.wasm_process_block(this.statePtr, ptr, size, format);
        this.lib.exports.wasm_free(ptr);
    }

    end() {
        if (this.isFreed) throw new Error("Cannot end: Stream already freed.");
        this.lib.exports.wasm_end_stream(this.statePtr);
    }

    getResults() {
        if (this.isFreed) throw new Error("Cannot get results: Stream already freed.");
        return this.lib._extractState(this.statePtr);
    }

    free() {
        if (!this.isFreed) {
            this.lib.exports.wasm_stream_state_deinit(this.statePtr);
            this.isFreed = true;
        }
    }
}

export class EgenInterface{
    #egen;
    async init(){
        const wasi = new WASI([], [], [
            new Fd(0), // stdin
            new Fd(1), // stdout
            new Fd(2), // stderr
        ]);
        const importObject = {
            wasi_snapshot_preview1: wasi.wasiImport,
        };
        const response = await fetch('../egen.wasm');
        const { instance } = await WebAssembly.instantiateStreaming(response, importObject);

        // Essential for Reactor model: call _initialize if it exists
        if (instance.exports._initialize) instance.exports._initialize();
        // console.log("Available WASM exports:", Object.keys(instance.exports));

        this.#egen = new LibEgen(instance);
    }

    async processSequence(input, format = DataFormat.PLAIN_TEXT) {
        if (input instanceof File || (input && input.constructor && input.constructor.name === 'File')) {
            const stream = this.#egen.createStream(); 
            
            try {
                const readStream = input.stream().pipeThrough(new TextDecoderStream());
                const reader = readStream.getReader();

                while (true) {
                    const { done, value } = await reader.read(); 
                    console.log(value);
                    if (value) {stream.process(value, format)};
                    if (done) break;
                }
                stream.end();
                
                const results = stream.getResults();
                return this._streamToString(results);

            } catch (error) {
                console.error("Streaming error:", error);
                throw error;
            } finally {
                stream.free();
            }
        } else {
            const result = await this.#egen.processSequence(input, format);
            return this._streamToString(result);
        }
    }
    
    _streamToString(stream){
        let message = `Nucleotides quantity: ${stream.nucleotidesCount}\n`;
        message += `Mode: ${this._getActiveModes(stream.mode)}\n`;
        message += `Class: ${Object.keys(SequenceClass)
            .find(key => SequenceClass[key] === stream.klass) || "Unknown"}\n`;

        message += "Anomalies:\n";
        if (stream.anomalies && Array.isArray(stream.anomalies)) {
            const anomalyKeys = stream.anomalies.map(item => item.type);
            const anomalies = this._getAnomaliesCount(anomalyKeys);
            anomalies.forEach((count, typeIndex) => {
                const typeName = Object.keys(AnomalyType)
                    .find(key => AnomalyType[key] === typeIndex) || "Unknown";
                message += `type: ${typeName}, quantity: ${count}\n`;
            });
        }
        return message;
    }

    _getActiveModes(decimalValue) {
        const active = [];
        for (const [name, bitValue] of Object.entries(SequenceMode))
            if (bitValue !== 0 && (decimalValue & bitValue) === bitValue) active.push(name);
        
        return active.length > 0 ? active : ["UNDEFINED"];
    }

    _getAnomaliesCount(anomalyKeys) {
        const anomalyDict = new Map();
        anomalyKeys.forEach(anomaly => {
            if (anomalyDict.has(anomaly)) {
                const currentCount = anomalyDict.get(anomaly);
                anomalyDict.set(anomaly, currentCount + 1);
            } 
            else anomalyDict.set(anomaly, 1);
        });
        return anomalyDict;
    }
}