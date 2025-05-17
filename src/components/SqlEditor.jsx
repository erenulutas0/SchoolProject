import React, { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { sql } from '@codemirror/lang-sql';
import { tags } from '@lezer/highlight';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';

const sqlHighlighting = HighlightStyle.define([
  // SQL clauses in blue (like SELECT, FROM, WHERE)
  { tag: tags.keyword, color: '#4b97e3' },
  
  // String literals in yellow (like 'IST')
  { tag: tags.string, color: '#f9d75c' },
  
  // Numbers in red
  { tag: tags.number, color: '#ff6b6b' },
  
  // Comments in gray
  { tag: tags.comment, color: '#929292', fontStyle: 'italic' },
  
  // Functions and identifiers
  { tag: tags.function, color: '#dcdcaa' },
  { tag: tags.variableName, color: '#bbbbbb' }
]);

export default function SqlEditor({ value, onChange }) {
  const editorRef = useRef();
  const viewRef = useRef(null);
  
  useEffect(() => {
    if (!editorRef.current) return;
    
    // Clear previous editor if it exists
    if (viewRef.current) {
      viewRef.current.destroy();
    }
    
    const updateListener = EditorView.updateListener.of(update => {
      if (update.docChanged) {
        onChange(update.state.doc.toString());
      }
    });
    
    viewRef.current = new EditorView({
      extensions: [
        basicSetup,
        sql(),
        syntaxHighlighting(sqlHighlighting),
        updateListener,
        EditorView.theme({
          "&": {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            height: "150px",
            borderRadius: "4px",
            border: "1px solid #444"
          },
          ".cm-scroller": { 
            fontFamily: "monospace", 
            fontSize: "14px",
            overflow: "auto"
          },
          ".cm-line": { padding: "0 8px" },
        })
      ],
      doc: value,
      parent: editorRef.current
    });
    
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
      }
    };
  }, [editorRef]);
  
  // Update editor content if value changes externally
  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0, 
          to: viewRef.current.state.doc.length,
          insert: value
        }
      });
    }
  }, [value]);
  
  return <div className="sql-editor" ref={editorRef} />;
}