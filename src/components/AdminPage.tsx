import { useMemo, useState } from "react";
import { ArrowLeft, RotateCcw, Send } from "lucide-react";
import { sampleVenues } from "../data/sampleVenues";

const samplePayload = {
  event: "access_card.published",
  schemaVersion: 1,
  cardId: sampleVenues[0].id,
  publicUrl: `https://cards.example.org/${sampleVenues[0].id}`,
  card: sampleVenues[0]
};

interface Failure {
  id: number;
  delivery_id: string | null;
  source: string;
  error_code: string;
  error_message: string;
  retry_count: number;
  created_at: string;
}

export function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem("adminToken") ?? "");
  const [payload, setPayload] = useState(() => JSON.stringify(samplePayload, null, 2));
  const [publicUrl, setPublicUrl] = useState("");
  const [result, setResult] = useState<string>("");
  const [failures, setFailures] = useState<Failure[]>([]);
  const headers = useMemo(
    () => ({
      authorization: `Bearer ${token}`,
      "content-type": "application/json"
    }),
    [token]
  );

  function rememberToken(value: string) {
    setToken(value);
    sessionStorage.setItem("adminToken", value);
  }

  async function importPayload() {
    setResult("送信中…");
    const response = await fetch("/api/admin/import", {
      method: "POST",
      headers,
      body: payload
    });
    setResult(JSON.stringify(await response.json(), null, 2));
  }

  async function importFromUrl() {
    setResult("取得中…");
    const response = await fetch("/api/admin/import-url", {
      method: "POST",
      headers,
      body: JSON.stringify({ publicUrl })
    });
    setResult(JSON.stringify(await response.json(), null, 2));
  }

  async function loadFailures() {
    const response = await fetch("/api/admin/failures", { headers });
    const data = (await response.json()) as { failures?: Failure[]; error?: string };
    setFailures(data.failures ?? []);
    if (data.error) setResult(JSON.stringify(data, null, 2));
  }

  async function retry(id: number) {
    const response = await fetch(`/api/admin/failures/${id}/retry`, {
      method: "POST",
      headers
    });
    setResult(JSON.stringify(await response.json(), null, 2));
    await loadFailures();
  }

  return (
    <main className="admin-page">
      <header>
        <a href="/" className="back-link">
          <ArrowLeft aria-hidden="true" size={18} />
          地図へ戻る
        </a>
        <h1>OPEN DOOR TOKYO 取り込み管理</h1>
        <p>
          自動連携が未設定でも、署名済みWebhookと同じスキーマを手動で検証・upsertできます。
          管理トークンはこのタブの sessionStorage のみに保持します。
        </p>
      </header>
      <section className="admin-auth" aria-labelledby="admin-auth-title">
        <h2 id="admin-auth-title">管理認証</h2>
        <label>
          ADMIN_TOKEN
          <input
            type="password"
            autoComplete="off"
            value={token}
            onChange={(event) => rememberToken(event.target.value)}
            placeholder="Cloudflare Secretに設定した管理トークン"
          />
        </label>
      </section>
      <div className="admin-grid">
        <section aria-labelledby="payload-title">
          <h2 id="payload-title">publish payload</h2>
          <p>
            `cardId` を主キーとしてupsertします。同じ本文の再送は重複作成されません。
          </p>
          <label>
            JSON
            <textarea
              className="json-editor"
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
              spellCheck={false}
            />
          </label>
          <button className="button primary" type="button" onClick={importPayload}>
            <Send aria-hidden="true" size={18} />
            JSONを検証して取り込む
          </button>
        </section>
        <section aria-labelledby="url-title">
          <h2 id="url-title">公開カードURL</h2>
          <p>
            `IMPORT_ALLOWED_HOSTS` に登録したHTTPSホストだけを取得します。
          </p>
          <label>
            公開カードURL
            <input
              type="url"
              value={publicUrl}
              onChange={(event) => setPublicUrl(event.target.value)}
              placeholder="https://cards.example.org/card.json"
            />
          </label>
          <button className="button secondary" type="button" onClick={importFromUrl}>
            URLから取得して取り込む
          </button>
          <div className="admin-result">
            <h3>処理結果</h3>
            <pre aria-live="polite">{result || "まだ処理していません"}</pre>
          </div>
        </section>
      </div>
      <section className="failure-section" aria-labelledby="failure-title">
        <div className="section-heading">
          <div>
            <h2 id="failure-title">未解決の失敗ログ</h2>
            <p>保存済みのpayloadを手動で再送できます。</p>
          </div>
          <button className="button secondary" type="button" onClick={loadFailures}>
            ログを更新
          </button>
        </div>
        {failures.length === 0 ? (
          <p className="empty-log">未解決ログはありません。</p>
        ) : (
          <div className="failure-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>日時</th>
                  <th>delivery</th>
                  <th>エラー</th>
                  <th>再試行</th>
                </tr>
              </thead>
              <tbody>
                {failures.map((failure) => (
                  <tr key={failure.id}>
                    <td>{failure.created_at}</td>
                    <td>{failure.delivery_id ?? "未確定"}</td>
                    <td>
                      <strong>{failure.error_code}</strong>
                      <span>{failure.error_message}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="retry-button"
                        onClick={() => retry(failure.id)}
                      >
                        <RotateCcw aria-hidden="true" size={16} />
                        再送 ({failure.retry_count})
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
