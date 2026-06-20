import { RiCloseLine } from "@remixicon/react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { AlgorithmOptions } from "../domain/chart";

interface AlgorithmDialogProps {
  options: AlgorithmOptions;
  onApply: (options: AlgorithmOptions) => void;
  onClose: () => void;
}

export function AlgorithmDialog({
  options,
  onApply,
  onClose,
}: AlgorithmDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [draft, setDraft] = useState(options);

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

  function updateOption<Key extends keyof AlgorithmOptions>(
    key: Key,
    value: AlgorithmOptions[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onApply(draft);
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
        <p className="settings-dialog__engine">
          iztro 2.5.8 · 本地计算 · 不含真太阳时
        </p>
        <form onSubmit={handleSubmit}>
          <div className="settings-fields">
            <label className="settings-field">
              <span>安星法</span>
              <select
                value={draft.algorithm}
                onChange={(event) =>
                  updateOption(
                    "algorithm",
                    event.target.value as AlgorithmOptions["algorithm"],
                  )
                }
              >
                <option value="default">通行版本</option>
                <option value="zhongzhou">中州派版本</option>
              </select>
            </label>

            <label className="settings-field">
              <span>年度分界</span>
              <select
                value={draft.yearDivide}
                onChange={(event) =>
                  updateOption(
                    "yearDivide",
                    event.target.value as AlgorithmOptions["yearDivide"],
                  )
                }
              >
                <option value="normal">农历正月初一</option>
                <option value="exact">立春</option>
              </select>
            </label>

            <label className="settings-field">
              <span>运限分界</span>
              <select
                value={draft.horoscopeDivide}
                onChange={(event) =>
                  updateOption(
                    "horoscopeDivide",
                    event.target.value as AlgorithmOptions["horoscopeDivide"],
                  )
                }
              >
                <option value="normal">农历正月初一</option>
                <option value="exact">立春</option>
              </select>
            </label>

            <label className="settings-field">
              <span>小限分界</span>
              <select
                value={draft.ageDivide}
                onChange={(event) =>
                  updateOption(
                    "ageDivide",
                    event.target.value as AlgorithmOptions["ageDivide"],
                  )
                }
              >
                <option value="normal">自然年</option>
                <option value="birthday">生日</option>
              </select>
            </label>

            <label className="settings-field">
              <span>晚子时归属</span>
              <select
                value={draft.dayDivide}
                onChange={(event) =>
                  updateOption(
                    "dayDivide",
                    event.target.value as AlgorithmOptions["dayDivide"],
                  )
                }
              >
                <option value="forward">计入次日</option>
                <option value="current">仍属当日</option>
              </select>
            </label>
          </div>
          <p className="settings-dialog__hint">
            不同流派会得到不同星曜与运限结果，网站只负责按所选口径排盘。
          </p>
          <p className="settings-dialog__hint">
            四柱神煞采用《三命通会》《渊海子平》所载首批 11
            项规则，逐项显示取法与出处，不作为单独断事结论。
          </p>
          <button className="primary-action" type="submit">
            应用并重新排盘
          </button>
        </form>
      </section>
    </div>
  );
}
