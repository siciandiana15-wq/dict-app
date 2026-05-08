import { useState, useRef, useEffect } from "react";

const PhoneticTag = ({ text }) => (
  <span style={{
    display: "inline-flex", alignItems: "center",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    padding: "3px 10px", fontSize: 13,
    color: "#6b7280",
    fontFamily: "monospace"
  }}>{text}</span>
);

const PartOfSpeech = ({ label }) => {
  const map = {
    noun:        { bg: "#E6F1FB", c: "#0C447C" },
    verb:        { bg: "#EAF3DE", c: "#3B6D11" },
    adjective:   { bg: "#FAEEDA", c: "#854F0B" },
    adverb:      { bg: "#FBEAF0", c: "#993556" },
    pronoun:     { bg: "#EEEDFE", c: "#534AB7" },
    preposition: { bg: "#E1F5EE", c: "#0F6E56" },
    conjunction: { bg: "#EEEDFE", c: "#3C3489" },
    interjection:{ bg: "#FAECE7", c: "#993C1D" },
  };
  const { bg, c } = map[label?.toLowerCase()] || { bg: "#F1EFE8", c: "#5F5E5A" };
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
      textTransform: "uppercase", background: bg, color: c,
      borderRadius: 6, padding: "2px 9px", display: "inline-block"
    }}>{label}</span>
  );
};

const SynonymPill = ({ word, onSearch }) => (
  <button onClick={() => onSearch(word)} style={{
    background: "#f9fafb", border: "1px solid #e5e7eb",
    borderRadius: 6, padding: "3px 10px", fontSize: 13,
    color: "#111827", cursor: "pointer"
  }}>{word}</button>
);

function EntryCard({ meaning, onSearch }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb",
      borderRadius: 10, padding: "1.25rem 1.5rem", marginBottom: 12
    }}>
      <div style={{ marginBottom: 14 }}>
        <PartOfSpeech label={meaning.partOfSpeech} />
      </div>
      <ol style={{ margin: 0, padding: "0 0 0 1.2rem" }}>
        {meaning.definitions.map((def, i) => (
          <li key={i} style={{ marginBottom: 12, color: "#111827", fontSize: 15, lineHeight: 1.65 }}>
            <span>{def.definition}</span>
            {def.example && (
              <div style={{
                marginTop: 5, fontSize: 13, fontStyle: "italic",
                color: "#6b7280", borderLeft: "2.5px solid #d1d5db", paddingLeft: 10
              }}>"{def.example}"</div>
            )}
          </li>
        ))}
      </ol>
      {(meaning.synonyms?.length > 0 || meaning.antonyms?.length > 0) && (
        <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {meaning.synonyms?.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>syn</span>
              {meaning.synonyms.slice(0, 5).map(s => <SynonymPill key={s} word={s} onSearch={onSearch} />)}
            </div>
          )}
          {meaning.antonyms?.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>ant</span>
              {meaning.antonyms.slice(0, 5).map(a => <SynonymPill key={a} word={a} onSearch={onSearch} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WordResult({ data, onSearch }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 6 }}>
          <h1 style={{ fontSize: 36, fontWeight: 600, margin: 0, color: "#111827", lineHeight: 1.1 }}>
            {data.word}
          </h1>
          {data.phonetic && <PhoneticTag text={data.phonetic} />}
        </div>
        {data.origin && (
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 0", fontStyle: "italic" }}>
            Origin: {data.origin}
          </p>
        )}
      </div>
      {data.meanings?.map((m, i) => (
        <EntryCard key={i} meaning={m} onSearch={onSearch} />
      ))}
    </div>
  );
}

const SUGGESTIONS = ["serendipity", "ephemeral", "melancholy", "ubiquitous", "petrichor", "limerence", "sonder", "hiraeth"];

export default function App() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const search = async (word) => {
    const w = (word || query).trim().toLowerCase();
    if (!w) return;
    setQuery(w);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("http://localhost:3001/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: w })
      });

      const data = await res.json();

      if (data.error) {
        setError(`No definition found for "${w}". Try a different spelling.`);
      } else {
        setResult(data);
        setHistory(prev => [w, ...prev.filter(x => x !== w)].slice(0, 10));
      }
    } catch {
      setError("Could not connect to server. Make sure server.js is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "2rem 1rem" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        input { width: 100%; padding: 10px 14px; font-size: 15px; border: 1px solid #d1d5db; border-radius: 8px; outline: none; }
        input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        button.primary { background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; white-space: nowrap; }
        button.primary:hover { background: #4f46e5; }
      `}</style>

      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px", color: "#111827" }}>
            English Dictionary
          </h1>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>
            Definitions, phonetics, examples & more
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search a word…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
          />
          <button className="primary" onClick={() => search()}>Look up</button>
        </div>

        {!result && !loading && !error && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>
              Try these
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SUGGESTIONS.map(w => (
                <button key={w} onClick={() => search(w)} style={{
                  background: "#fff", border: "1px solid #e5e7eb",
                  borderRadius: 8, padding: "5px 14px", fontSize: 13,
                  fontStyle: "italic", color: "#6b7280", cursor: "pointer"
                }}>{w}</button>
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div style={{
            background: "#fff", border: "1px solid #e5e7eb",
            borderRadius: 10, padding: "0.85rem 1.25rem", marginBottom: 20
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af" }}>Recent</span>
              <button onClick={() => setHistory([])} style={{ background: "none", border: "none", fontSize: 11, color: "#9ca3af", cursor: "pointer", padding: 0 }}>Clear</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {history.map(w => (
                <button key={w} onClick={() => search(w)} style={{
                  background: "#f9fafb", border: "1px solid #e5e7eb",
                  borderRadius: 6, padding: "3px 10px", fontSize: 13,
                  color: "#6b7280", cursor: "pointer"
                }}>{w}</button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "2rem 0", color: "#6b7280" }}>
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              border: "2px solid #e5e7eb", borderTopColor: "#6366f1",
              animation: "spin 0.7s linear infinite"
            }} />
            <span style={{ fontSize: 14 }}>Looking up "{query}"…</span>
          </div>
        )}

        {error && !loading && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 10, padding: "1rem 1.25rem",
            color: "#dc2626", fontSize: 14
          }}>{error}</div>
        )}

        {result && !loading && <WordResult data={result} onSearch={search} />}
      </div>
    </div>
  );
}
