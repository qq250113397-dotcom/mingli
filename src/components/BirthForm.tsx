import { useState, type FormEvent } from "react";
import { RiCalendar2Line, RiInformationLine } from "@remixicon/react";
import { TIME_OPTIONS, type BirthInput, type Gender } from "../domain/chart";

interface BirthFormProps {
  initialBirth: BirthInput;
  initialYear: number;
  onSubmit: (birth: BirthInput, year: number) => void;
}

export function BirthForm({
  initialBirth,
  initialYear,
  onSubmit,
}: BirthFormProps) {
  const [birth, setBirth] = useState(initialBirth);
  const [year, setYear] = useState(initialYear);

  function updateBirth<Key extends keyof BirthInput>(
    key: Key,
    value: BirthInput[Key],
  ) {
    setBirth((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(birth, year);
  }

  function selectGender(gender: Gender) {
    updateBirth("gender", gender);
  }

  return (
    <form className="birth-form" onSubmit={handleSubmit}>
      <div className="section-heading section-heading--compact">
        <div>
          <span className="section-kicker">输入生辰</span>
          <h2>排一张有出处的命盘</h2>
        </div>
        <RiCalendar2Line aria-hidden="true" />
      </div>

      <div className="birth-form__grid">
        <label className="field">
          <span>历法</span>
          <select
            value={birth.calendar}
            onChange={(event) =>
              updateBirth(
                "calendar",
                event.target.value as BirthInput["calendar"],
              )
            }
          >
            <option value="solar">公历</option>
            <option value="lunar">农历</option>
          </select>
        </label>

        <label className="field field--wide">
          <span>出生日期</span>
          <input
            type="date"
            value={birth.date}
            onChange={(event) => updateBirth("date", event.target.value)}
            required
          />
        </label>

        <fieldset className="field gender-field">
          <legend>性别</legend>
          <div className="segmented-control" aria-label="性别">
            {(["男", "女"] as const).map((gender) => (
              <button
                className={
                  birth.gender === gender
                    ? "segment is-active"
                    : "segment"
                }
                type="button"
                aria-pressed={birth.gender === gender}
                onClick={() => selectGender(gender)}
                key={gender}
              >
                {gender}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="field field--time">
          <span>出生时辰</span>
          <select
            value={birth.timeIndex}
            onChange={(event) =>
              updateBirth("timeIndex", Number(event.target.value))
            }
          >
            {TIME_OPTIONS.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>查看流年</span>
          <input
            type="number"
            min="1900"
            max="2100"
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            required
          />
        </label>

        {birth.calendar === "lunar" && (
          <label className="check-field">
            <input
              type="checkbox"
              checked={birth.isLeapMonth}
              onChange={(event) =>
                updateBirth("isLeapMonth", event.target.checked)
              }
            />
            <span>这是闰月</span>
          </label>
        )}

        <label className="check-field check-field--help">
          <input
            type="checkbox"
            checked={birth.fixLeap}
            onChange={(event) => updateBirth("fixLeap", event.target.checked)}
          />
          <span>按十五日校正闰月</span>
          <span
            className="icon-help"
            title="闰月十五日及以前算本月，之后按下月处理。"
          >
            <RiInformationLine aria-hidden="true" />
          </span>
        </label>
      </div>

      <button className="primary-action" type="submit">
        开始排盘
      </button>
      <p className="privacy-note">
        生辰只在你的浏览器本地计算，不会上传或保存。
      </p>
    </form>
  );
}
