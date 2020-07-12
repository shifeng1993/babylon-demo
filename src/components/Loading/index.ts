export interface ILoadingScreen {
  //What happens when loading starts
  displayLoadingUI: () => void;
  //What happens when loading stops
  hideLoadingUI: () => void;
  //default loader support. Optional!
  loadingUIBackgroundColor: string;
  loadingUIText: string;
}

export class LoadingScreen implements ILoadingScreen {
  public loadingUIBackgroundColor!: string;
  public loadingEl!: HTMLElement;
  constructor(public loadingUIText: string) {}
  public displayLoadingUI() {
    // 做一个div样式使用全局样式内的loading
    this.loadingEl = document.createElement('div');
    this.loadingEl.setAttribute('id', 'load-container');
    this.loadingEl.setAttribute('class', 'load-container');

    this.loadingEl.innerHTML = `
      <div class="load-wrapper">${this.loadingUIText}</div>
    `;
    // 加载到body内
    document.body.appendChild(this.loadingEl)
    // alert(this.loadingUIText);
  }

  public hideLoadingUI() {
    let oldattr = this.loadingEl.getAttribute('class');
    this.loadingEl.setAttribute('class', oldattr + ' loaded');

    // 结束加载后给多少延迟
    let timeOut: number = 300;
    let duration: number = 500; // 动画执行时间

    // 用css3动画延迟加js延迟，进行配合 +300 是因为loading的fadeout动画有0.3秒
    this.loadingEl.style.animationDelay = timeOut / 1000 + 's';
    this.loadingEl.style.animationDuration = duration / 1000 + 's';

    setTimeout(() => {
      this.loadingEl?.parentNode && this.loadingEl?.parentNode.removeChild(this.loadingEl);
    }, timeOut + duration);
  }
}