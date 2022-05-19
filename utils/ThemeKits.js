
const ThemeKits =  {
  currentTheme() {
    // get theme config from local stroage
    const theme = localStorage.getItem('theme');
    return theme || 'light';
  },
  isDarkTheme() {
    return this.currentTheme() === 'dark';
  },
  setDarkTheme() {
    localStorage.setItem('theme', 'dark');
  },
  setLigitTheme() {
    localStorage.setItem('theme', 'light');
  },
  getDefaultFontFamily() {
    return "'仿宋','Courier New', Courier, monospace;";
  },
  getThemeFontFamily() {
    // get font family from local stroage
    const fontFamily = localStorage.getItem('fontFamily') || this.getDefaultFontFamily();
    return fontFamily;
  }
}

export default ThemeKits;