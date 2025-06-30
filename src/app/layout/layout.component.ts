import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  isSidebarCollapsed = false;
  isRtl = false;

  constructor() {
    this.setRtlFromDocument();
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  setRtlFromDocument() {
    // Listen for changes to the document direction
    const updateRtl = () => {
      this.isRtl = document.documentElement.getAttribute('dir') === 'rtl';
    };
    updateRtl();
    // Optionally, listen for changes (if language can change at runtime)
    const observer = new MutationObserver(updateRtl);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
  }
}
