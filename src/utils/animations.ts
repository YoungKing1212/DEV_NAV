import type { DirectiveBinding } from 'vue'

// 淡入动画
export const fadeIn = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const delay = binding.value?.delay || 0
    const duration = binding.value?.duration || 300
    
    el.style.opacity = '0'
    el.style.transition = `opacity ${duration}ms ease-in-out`
    
    setTimeout(() => {
      el.style.opacity = '1'
    }, delay)
  }
}

// 滑入动画
export const slideIn = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const direction = binding.arg || 'left'
    const delay = binding.value?.delay || 0
    const duration = binding.value?.duration || 300
    const distance = binding.value?.distance || '20px'
    
    const transforms = {
      left: `translateX(-${distance})`,
      right: `translateX(${distance})`,
      top: `translateY(-${distance})`,
      bottom: `translateY(${distance})`
    }
    
    el.style.opacity = '0'
    el.style.transform = transforms[direction as keyof typeof transforms]
    el.style.transition = `all ${duration}ms ease-out`
    
    setTimeout(() => {
      el.style.opacity = '1'
      el.style.transform = 'translate(0)'
    }, delay)
  }
}

// 缩放动画
export const scale = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const delay = binding.value?.delay || 0
    const duration = binding.value?.duration || 300
    const scale = binding.value?.scale || 0.95
    
    el.style.opacity = '0'
    el.style.transform = `scale(${scale})`
    el.style.transition = `all ${duration}ms ease-out`
    
    setTimeout(() => {
      el.style.opacity = '1'
      el.style.transform = 'scale(1)'
    }, delay)
  }
}

// 交错动画
export const stagger = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const index = binding.value?.index || 0
    const baseDelay = binding.value?.baseDelay || 0
    const staggerDelay = binding.value?.staggerDelay || 100
    const duration = binding.value?.duration || 300
    
    el.style.opacity = '0'
    el.style.transform = 'translateY(20px)'
    el.style.transition = `all ${duration}ms ease-out`
    
    setTimeout(() => {
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    }, baseDelay + (index * staggerDelay))
  }
} 