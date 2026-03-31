package dev.egen.egen.Controllers.CScripts;

import com.sun.jna.Library;
import com.sun.jna.Native;
import java.io.File;
import java.nio.file.Path;

public interface CLibsController extends Library {

    String DLL_PATH = System.getProperty("user.dir") + 
        File.separator + Path.of("src", "main", "resources", "static", "c_libs", "script.dll").toString();

    CLibsController INSTANCE = Native.load(DLL_PATH, CLibsController.class);

    int add(int a, int b);
}