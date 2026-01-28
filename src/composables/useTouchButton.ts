// src/composables/useTouchButton.ts
// 터치 버튼 동작을 위한 composable
// 터치를 뗄 때 해당 요소 위에 있을 때만 동작하도록 함

import { ref, type Ref } from 'vue';

export interface UseTouchButtonOptions {
  onTap?: (event: TouchEvent | MouseEvent) => void;
  disabled?: Ref<boolean> | boolean;
}

export function useTouchButton(
  elementRef: Ref<HTMLElement | null>,
  options: UseTouchButtonOptions = {}
) {
  const isPressed = ref(false);
  const isTouchInside = ref(false);
  let touchId: number | null = null;

  // Check if touch point is inside element
  function isTouchInsideElement(touch: Touch): boolean {
    if (!elementRef.value) return false;
    const rect = elementRef.value.getBoundingClientRect();
    return (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    );
  }

  // Check disabled state
  function isDisabled(): boolean {
    if (typeof options.disabled === 'boolean') {
      return options.disabled;
    }
    return options.disabled?.value ?? false;
  }

  // Touch start - begin press state
  function handleTouchStart(event: TouchEvent) {
    if (isDisabled()) return;

    const touch = event.touches[0];
    if (!touch) return;

    event.preventDefault();
    touchId = touch.identifier;
    isPressed.value = true;
    isTouchInside.value = true;
  }

  // Touch move - track if still inside element
  function handleTouchMove(event: TouchEvent) {
    if (touchId === null) return;

    // Find our touch
    const touch = Array.from(event.touches).find(t => t.identifier === touchId);
    if (!touch) return;

    isTouchInside.value = isTouchInsideElement(touch);
  }

  // Touch end - trigger action only if inside
  function handleTouchEnd(event: TouchEvent) {
    if (touchId === null) return;

    event.preventDefault();

    // Find our touch in changedTouches
    const touch = Array.from(event.changedTouches).find(t => t.identifier === touchId);

    // Check if touch ended inside element
    if (touch && isTouchInsideElement(touch) && isTouchInside.value) {
      options.onTap?.(event);
    }

    // Reset state
    isPressed.value = false;
    isTouchInside.value = false;
    touchId = null;
  }

  // Touch cancel - reset state without action
  function handleTouchCancel() {
    isPressed.value = false;
    isTouchInside.value = false;
    touchId = null;
  }

  // Mouse click - for desktop support
  function handleClick(event: MouseEvent) {
    if (isDisabled()) return;
    // Prevent double-firing on touch devices (touch events fire click too)
    if (touchId !== null) return;
    options.onTap?.(event);
  }

  return {
    isPressed,
    isTouchInside,
    handlers: {
      onTouchstart: handleTouchStart,
      onTouchmove: handleTouchMove,
      onTouchend: handleTouchEnd,
      onTouchcancel: handleTouchCancel,
      onClick: handleClick,
    },
    // For manual binding
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    handleClick,
  };
}
