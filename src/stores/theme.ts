import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeType = 'pink' | 'blue' | 'green' | 'purple' | 'orange' | 'teal'

interface ThemeConfig {
  name: ThemeType
  primary: string
  light: string
  dark: string
  gradient: string
}

export const themeConfigs: Record<ThemeType, ThemeConfig> = {
  pink: {
    name: 'pink',
    primary: '#ff6b9d',
    light: '#ffecd2',
    dark: '#ff9a9e',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  },
  blue: {
    name: 'blue',
    primary: '#4a90e2',
    light: '#e6f1ff',
    dark: '#357abd',
    gradient: 'linear-gradient(135deg, #e6f1ff 0%, #cde3ff 100%)'
  },
  green: {
    name: 'green',
    primary: '#67c23a',
    light: '#e6f7ff',
    dark: '#85ce61',
    gradient: 'linear-gradient(135deg, #f0f9ff 0%, #d4f5e3 100%)'
  },
  purple: {
    name: 'purple',
    primary: '#8e7cc3',
    light: '#f3e5f5',
    dark: '#ab98c2',
    gradient: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)'
  },
  orange: {
    name: 'orange',
    primary: '#fb7c1b',
    light: '#fff7e6',
    dark: '#fd9c4e',
    gradient: 'linear-gradient(135deg, #fff7e6 0%, #ffe8cc 100%)'
  },
  teal: {
    name: 'teal',
    primary: '#20c997',
    light: '#e8f9f7',
    dark: '#51d5c2',
    gradient: 'linear-gradient(135deg, #e8f9f7 0%, #c9edeb 100%)'
  }
}

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeType>(
    (localStorage.getItem('app-theme') as ThemeType) || 'blue'
  )

  const themeConfig = ref<ThemeConfig>(themeConfigs[currentTheme.value])

  // 应用主题到DOM
  const applyTheme = (theme: ThemeType) => {
    const config = themeConfigs[theme]
    const root = document.documentElement

    root.style.setProperty('--theme-primary', config.primary)
    root.style.setProperty('--theme-light', config.light)
    root.style.setProperty('--theme-dark', config.dark)
    root.style.setProperty('--theme-gradient', config.gradient)

    currentTheme.value = theme
    themeConfig.value = config
    localStorage.setItem('app-theme', theme)
  }

  // 初始化主题
  const initTheme = () => {
    applyTheme(currentTheme.value)
  }

  // 切换主题
  const switchTheme = (theme: ThemeType) => {
    applyTheme(theme)
  }

  // 获取所有可用主题
  const getAvailableThemes = () => {
    return Object.keys(themeConfigs) as ThemeType[]
  }

  // 监听主题变化
  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme)
  })

  return {
    currentTheme,
    themeConfig,
    applyTheme,
    initTheme,
    switchTheme,
    getAvailableThemes,
    themeConfigs
  }
})
