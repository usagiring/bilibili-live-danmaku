### vue-cli
vue ui

### iview
Switch -> i-switch
Circle -> i-circle
Col -> i-col

元素包裹性
包裹性就是父元素的宽度会收缩到和内部元素宽度一样。

### vue
单文件组件设置body style 需要在生命周期beforecreate时设置（需探究原因）

### vuex-electron
默认使用 electron-store 存储
```
import Store from "electron-store";
const store = new Store({ name: "vuex" });
store.clear();
```

### 关闭windowshadow避免resize产生重影

### production debug: --remote-debugging-port=8315, http://localhost:8315/