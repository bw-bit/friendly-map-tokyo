import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { AccessCard } from "../domain/accessCard";

interface CorrectionDialogProps {
  open: boolean;
  venue: AccessCard;
  onClose: () => void;
}

export function CorrectionDialog({
  open,
  venue,
  onClose
}: CorrectionDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    const response = await fetch("/api/corrections", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ venueId: venue.id, message, contact })
    });
    if (response.ok) {
      setStatus("sent");
      setMessage("");
      setContact("");
    } else {
      setStatus("error");
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="correction-dialog"
      onClose={onClose}
      aria-labelledby="correction-title"
    >
      <form onSubmit={submit}>
        <div className="dialog-header">
          <div>
            <h2 id="correction-title">情報修正を依頼</h2>
            <p>{venue.name.ja}</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X aria-hidden="true" />
            <span className="sr-only">閉じる</span>
          </button>
        </div>
        {status === "sent" ? (
          <div className="success-message" role="status">
            送信しました。確認後に掲載内容へ反映します。
          </div>
        ) : (
          <>
            <label>
              修正内容
              <textarea
                required
                minLength={10}
                maxLength={1500}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="例: 入口の幅は現在80cmです。確認できた日時もお知らせください。"
              />
            </label>
            <label>
              連絡先（任意・公開されません）
              <input
                value={contact}
                maxLength={240}
                onChange={(event) => setContact(event.target.value)}
                placeholder="メールアドレスなど"
              />
            </label>
            {status === "error" ? (
              <p className="form-error" role="alert">
                送信できませんでした。時間をおいて再度お試しください。
              </p>
            ) : null}
            <button className="button primary" disabled={status === "sending"}>
              {status === "sending" ? "送信中…" : "修正依頼を送信"}
            </button>
          </>
        )}
      </form>
    </dialog>
  );
}

