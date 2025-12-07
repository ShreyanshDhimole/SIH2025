

import React from "react";
import { useForm } from "../../context/FormContext";
import "./Stepper.css";

/*
  Example steps (7 shown in screenshot). Adjust labels array as needed.
  The component reads state.currentStep from FormContext.
*/
const steps = [
  { num: 1, label: 'Eligibility' },
  { num: 2, label: 'Personal' },
  { num: 3, label: 'Background' },
  { num: 4, label: 'Household' },
  { num: 5, label: 'Status' }
];

export default function Stepper() {
  const { state } = useForm();
  const current = state.currentStep || 1;

  return (
    <nav className="stepper-wrap" aria-label="progress">
      <ol className="stepper-line-wrap">
        {steps.map((s, i) => {
          const done = current > s.num;
          const active = current === s.num;
          const nextIsActive = current === s.num + 1;
          const isLast = i === steps.length - 1;

          return (
            <li
              key={s.num}
              className={`stepper-item ${done ? "done" : ""} ${active ? "active" : ""} ${!done && !active ? "future" : ""}`}
              aria-current={active ? "step" : undefined}
            >
            

              <div className="stepper-node">
                <div className={`step-circle ${done ? "done" : ""} ${active ? "active" : ""}`}>
                  {done ? "✓" : s.num}
                </div>

                {/* connector towards the next node */}
                {!isLast && (
                  <div
                    className={`connector ${done ? "connector-done" : active ? "connector-active" : "connector-future"}`}
                    aria-hidden
                  />
                )}
              </div>

              <div className="stepper-label">{s.label}</div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
