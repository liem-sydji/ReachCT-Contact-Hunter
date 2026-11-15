import bugSrc from "../assets/reachai-bug.png";

/**
 * ReachAI pixel bug mascot.
 * mood: "idle" | "thinking" | "happy"
 */
export default function ReachAIBug({ mood = "idle", size = 40, className = "" }) {
  return (
    <div
      className={`reachai-bug reachai-bug--${mood} ${className}`}
      style={{ "--bug-size": `${size}px` }}
      aria-hidden="true"
    >
      {mood === "thinking" && (
        <div className="reachai-bug__thoughts">
          <span className="reachai-bug__thought reachai-bug__thought--1">·</span>
          <span className="reachai-bug__thought reachai-bug__thought--2">✦</span>
          <span className="reachai-bug__thought reachai-bug__thought--3">?</span>
          <span className="reachai-bug__thought reachai-bug__thought--4">·</span>
          <span className="reachai-bug__cloud reachai-bug__cloud--a" />
          <span className="reachai-bug__cloud reachai-bug__cloud--b" />
          <span className="reachai-bug__cloud reachai-bug__cloud--c" />
        </div>
      )}

      <div className="reachai-bug__body">
        <img
          src={bugSrc}
          alt=""
          className="reachai-bug__sprite"
          width={size}
          height={size}
          draggable={false}
        />
        {mood === "happy" && <span className="reachai-bug__smile" />}
      </div>
    </div>
  );
}
