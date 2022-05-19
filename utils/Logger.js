const level = "info";
// const level = "debug";

const Logger = {
  error: function(...message) {
    console.log("[ERROR]",...message)
  },
  warn: function(...message) {
    console.log("[WARN]",...message)
  },
  info: function(...message) {
    console.log("[INFO]",...message)
  },
  debug: function(...message) {
    if (level === "debug") {
      console.log("[DEBUG]",...message)
    }
  }
}

export default Logger;