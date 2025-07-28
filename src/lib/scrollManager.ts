/**
 * Scroll utilities for managing page scroll behavior
 */

export class ScrollManager {
  private static scrollPosition = 0;

  /**
   * Save the current scroll position
   */
  static savePosition() {
    this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  }

  /**
   * Restore the saved scroll position
   */
  static restorePosition() {
    requestAnimationFrame(() => {
      window.scrollTo(0, this.scrollPosition);
    });
  }

  /**
   * Smooth scroll to top
   */
  static scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /**
   * Smooth scroll to element
   */
  static scrollToElement(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  /**
   * Check if user has scrolled
   */
  static hasScrolled(): boolean {
    return window.pageYOffset > 0;
  }

  /**
   * Lock body scroll and save position
   */
  static lockScroll() {
    this.savePosition();
    document.body.classList.add('scroll-locked');
  }

  /**
   * Unlock body scroll and restore position
   */
  static unlockScroll() {
    document.body.classList.remove('scroll-locked');
    this.restorePosition();
  }
}
