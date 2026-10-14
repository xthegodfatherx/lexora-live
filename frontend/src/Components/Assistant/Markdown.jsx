import React from 'react';

// Rendu Markdown minimal et SÛR pour les réponses de l'IA : on construit des éléments
// React (jamais de dangerouslySetInnerHTML), donc aucun HTML du modèle n'est interprété.
// Gère : titres, gras, italique, code, liens http(s), listes, citations, tableaux, ---.
// dir="auto" : un paragraphe en arabe s'affiche de droite à gauche tout seul.

const INLINE = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\(https?:\/\/[^)\s]+\)|\*[^*\n]+\*)/g;

function inline(text, keyPrefix) {
    return String(text).split(INLINE).filter((part) => part !== '').map((part, i) => {
        const key = `${keyPrefix}-${i}`;
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return <strong key={key} className="font-semibold">{inline(part.slice(2, -2), key)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
            return <code key={key} className="px-1 py-0.5 rounded bg-gray-100 text-[0.85em] font-mono">{part.slice(1, -1)}</code>;
        }
        const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
        if (link) {
            return <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-orange-600 underline hover:text-orange-700">{link[1]}</a>;
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
            return <em key={key}>{inline(part.slice(1, -1), key)}</em>;
        }
        return <React.Fragment key={key}>{part}</React.Fragment>;
    });
}

const isTableRow = (line) => /^\s*\|.*\|\s*$/.test(line);
const isTableDivider = (line) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
const cells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
const UL = /^\s*[-*•]\s+(.*)$/;
const OL = /^\s*\d+[.)]\s+(.*)$/;

function parse(source) {
    const lines = String(source || '').replace(/\r/g, '').split('\n');
    const blocks = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (!line.trim()) { i += 1; continue; }

        if (line.trim().startsWith('```')) {
            const code = [];
            i += 1;
            while (i < lines.length && !lines[i].trim().startsWith('```')) { code.push(lines[i]); i += 1; }
            i += 1;
            blocks.push({ type: 'code', text: code.join('\n') });
            continue;
        }
        if (isTableRow(line) && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
            const head = cells(line);
            const rows = [];
            i += 2;
            while (i < lines.length && isTableRow(lines[i])) { rows.push(cells(lines[i])); i += 1; }
            blocks.push({ type: 'table', head, rows });
            continue;
        }
        const heading = line.match(/^\s*(#{1,4})\s+(.*)$/);
        if (heading) { blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] }); i += 1; continue; }
        if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { blocks.push({ type: 'hr' }); i += 1; continue; }
        if (/^\s*>/.test(line)) {
            const quote = [];
            while (i < lines.length && /^\s*>/.test(lines[i])) { quote.push(lines[i].replace(/^\s*>\s?/, '')); i += 1; }
            blocks.push({ type: 'quote', text: quote.join('\n') });
            continue;
        }
        if (UL.test(line) || OL.test(line)) {
            const ordered = OL.test(line) && !UL.test(line);
            const pattern = ordered ? OL : UL;
            const items = [];
            while (i < lines.length && (pattern.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
                const m = lines[i].match(pattern);
                if (m) items.push(m[1]);
                else items[items.length - 1] += ` ${lines[i].trim().replace(/^[-*•]\s+/, '— ')}`;
                i += 1;
            }
            blocks.push({ type: 'list', ordered, items });
            continue;
        }
        const para = [];
        while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith('```') && !/^\s*(#{1,4})\s+/.test(lines[i])
            && !/^\s*>/.test(lines[i]) && !UL.test(lines[i]) && !OL.test(lines[i])
            && !(isTableRow(lines[i]) && i + 1 < lines.length && isTableDivider(lines[i + 1]))) {
            para.push(lines[i]);
            i += 1;
        }
        blocks.push({ type: 'p', lines: para });
    }
    return blocks;
}

const Markdown = ({ text, className = '' }) => (
    <div className={`space-y-2 text-sm leading-relaxed break-words ${className}`}>
        {parse(text).map((b, idx) => {
            const key = `b${idx}`;
            switch (b.type) {
                case 'heading':
                    return <p key={key} dir="auto" className={`font-semibold text-gray-900 ${b.level <= 2 ? 'text-base' : 'text-sm'} pt-1`}>{inline(b.text, key)}</p>;
                case 'hr':
                    return <hr key={key} className="border-gray-200" />;
                case 'code':
                    return <pre key={key} className="p-3 rounded-lg bg-gray-900 text-gray-100 text-xs overflow-x-auto"><code>{b.text}</code></pre>;
                case 'quote':
                    return <blockquote key={key} dir="auto" className="pl-3 border-l-4 border-orange-300 bg-orange-50/60 py-1.5 pr-2 rounded-r text-gray-700 whitespace-pre-wrap">{inline(b.text, key)}</blockquote>;
                case 'list': {
                    const Tag = b.ordered ? 'ol' : 'ul';
                    return (
                        <Tag key={key} dir="auto" className={`${b.ordered ? 'list-decimal' : 'list-disc'} pl-5 space-y-1`}>
                            {b.items.map((item, j) => <li key={`${key}-${j}`}>{inline(item, `${key}-${j}`)}</li>)}
                        </Tag>
                    );
                }
                case 'table':
                    return (
                        <div key={key} className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full text-xs">
                                <thead className="bg-gray-50">
                                    <tr>{b.head.map((h, j) => <th key={`${key}-h${j}`} className="px-2.5 py-1.5 text-left font-semibold text-gray-700 whitespace-nowrap">{inline(h, `${key}-h${j}`)}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {b.rows.map((row, r) => (
                                        <tr key={`${key}-r${r}`} className="border-t border-gray-100">
                                            {row.map((c, j) => <td key={`${key}-r${r}-${j}`} className="px-2.5 py-1.5 align-top">{inline(c, `${key}-r${r}-${j}`)}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                default:
                    return (
                        <p key={key} dir="auto">
                            {b.lines.map((l, j) => (
                                <React.Fragment key={`${key}-${j}`}>
                                    {j > 0 && <br />}
                                    {inline(l, `${key}-${j}`)}
                                </React.Fragment>
                            ))}
                        </p>
                    );
            }
        })}
    </div>
);

export default Markdown;
