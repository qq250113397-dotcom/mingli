import { RiCloseLine } from "@remixicon/react";
import { useEffect, useRef, type KeyboardEvent } from "react";

export function AlgorithmDialog({ onClose }: { onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      onClose();
      return;
    }

    if (event.key !== "Tab") return;

    const controls = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute("disabled"));
    const firstControl = controls[0];
    const lastControl = controls[controls.length - 1];

    if (event.shiftKey && document.activeElement === firstControl) {
      event.preventDefault();
      lastControl?.focus();
    } else if (!event.shiftKey && document.activeElement === lastControl) {
      event.preventDefault();
      firstControl?.focus();
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <button
          ref={closeButtonRef}
          className="icon-button settings-dialog__close"
          type="button"
          aria-label="关闭算法说明"
          onClick={onClose}
        >
          <RiCloseLine aria-hidden="true" />
        </button>
        <span className="section-kicker">算法口径</span>
        <h2 id="settings-title">这张命盘怎么算</h2>
        <dl>
          <div>
            <dt>排盘引擎</dt>
            <dd>iztro 2.5.8 默认配置</dd>
          </div>
          <div>
            <dt>闰月规则</dt>
            <dd>可选择十五日前后校正</dd>
          </div>
          <div>
            <dt>时间口径</dt>
            <dd>按十二时辰，不含真太阳时</dd>
          </div>
          <div>
            <dt>隐私</dt>
            <dd>全部在浏览器本地计算，不上传生辰</dd>
          </div>
        </dl>
        <button className="primary-action" type="button" onClick={onClose}>
          我知道了
        </button>
      </section>
    </div>
  );
}
