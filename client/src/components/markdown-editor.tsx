import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import MarkdownRenderer from "./markdown-renderer";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Video,
  Columns,
  Maximize2,
  Eye,
} from "lucide-react";

type ViewMode = "edit" | "preview" | "split";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onInsertImage?: () => void;
  placeholder?: string;
  minHeight?: string;
}

const editorTheme = EditorView.theme({
  "&": {
    fontSize: "14px",
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
  },
  ".cm-content": {
    padding: "16px",
    minHeight: "400px",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    border: "none",
  },
  ".cm-line": {
    padding: "2px 0",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-scroller": {
    overflow: "auto",
  },
});

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

export default function MarkdownEditor({
  value,
  onChange,
  onInsertImage,
  placeholder = "Write your content in Markdown...",
  minHeight = "500px",
}: MarkdownEditorProps) {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  
  useEffect(() => {
    if (isMobile && viewMode === "split") {
      setViewMode("edit");
    }
  }, [isMobile]);

  const extensions = useMemo(
    () => [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      EditorView.lineWrapping,
      editorTheme,
    ],
    []
  );

  const insertAtCursor = useCallback(
    (text: string, wrapBefore?: string, wrapAfter?: string) => {
      const view = editorRef.current?.view;
      if (!view) {
        onChange(value + text);
        return;
      }

      const state = view.state;
      const selection = state.selection.main;
      const hasSelection = selection.from !== selection.to;

      if (hasSelection && wrapBefore && wrapAfter) {
        const selectedText = state.sliceDoc(selection.from, selection.to);
        const newText = wrapBefore + selectedText + wrapAfter;
        view.dispatch({
          changes: { from: selection.from, to: selection.to, insert: newText },
          selection: { anchor: selection.from + wrapBefore.length, head: selection.from + wrapBefore.length + selectedText.length },
        });
        onChange(view.state.doc.toString());
      } else {
        const cursorPos = selection.to;
        view.dispatch({
          changes: { from: cursorPos, insert: text },
          selection: { anchor: cursorPos + text.length },
        });
        onChange(view.state.doc.toString());
      }
      view.focus();
    },
    [value, onChange]
  );

  const toolbarActions = [
    {
      icon: Bold,
      label: "Bold",
      action: () => insertAtCursor("**bold**", "**", "**"),
      testId: "toolbar-bold",
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => insertAtCursor("*italic*", "*", "*"),
      testId: "toolbar-italic",
    },
    { type: "separator" },
    {
      icon: Heading1,
      label: "Heading 1",
      action: () => insertAtCursor("\n# Heading\n"),
      testId: "toolbar-h1",
    },
    {
      icon: Heading2,
      label: "Heading 2",
      action: () => insertAtCursor("\n## Heading\n"),
      testId: "toolbar-h2",
    },
    {
      icon: Heading3,
      label: "Heading 3",
      action: () => insertAtCursor("\n### Heading\n"),
      testId: "toolbar-h3",
    },
    { type: "separator" },
    {
      icon: List,
      label: "Bullet List",
      action: () => insertAtCursor("\n- Item\n"),
      testId: "toolbar-bullet-list",
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => insertAtCursor("\n1. Item\n"),
      testId: "toolbar-numbered-list",
    },
    {
      icon: Quote,
      label: "Quote",
      action: () => insertAtCursor("\n> Quote\n"),
      testId: "toolbar-quote",
    },
    {
      icon: Code,
      label: "Code Block",
      action: () => insertAtCursor("\n```\ncode\n```\n"),
      testId: "toolbar-code",
    },
    { type: "separator" },
    {
      icon: Link,
      label: "Link",
      action: () => insertAtCursor("[text](url)", "[", "](url)"),
      testId: "toolbar-link",
    },
    {
      icon: Image,
      label: "Image",
      action: onInsertImage || (() => insertAtCursor("![alt](url)")),
      testId: "toolbar-image",
    },
    {
      icon: Video,
      label: "Video",
      action: () => insertAtCursor('\n<video controls src="url.mp4"></video>\n'),
      testId: "toolbar-video",
    },
  ];

  const toolbarButtonsOnly = toolbarActions.filter(item => item.type !== "separator");

  const renderEditorPane = () => (
    <div className="overflow-auto h-full" data-testid="editor-pane">
      <CodeMirror
        ref={editorRef}
        value={value}
        onChange={onChange}
        extensions={extensions}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          highlightActiveLine: false,
          highlightSelectionMatches: false,
        }}
        className="h-full"
      />
    </div>
  );

  const renderPreviewPane = () => (
    <div className="overflow-auto p-4 sm:p-6 bg-card h-full" data-testid="preview-pane">
      {value ? (
        <MarkdownRenderer content={value} />
      ) : (
        <p className="text-muted-foreground italic">
          Start typing to see a preview...
        </p>
      )}
    </div>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-background" data-testid="markdown-editor">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 sm:px-3 py-2 border-b bg-muted/30">
        <div className="flex flex-wrap items-center gap-0.5 sm:gap-1" data-testid="editor-toolbar">
          {toolbarButtonsOnly.map((item, index) => (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
              onClick={item.action}
              title={item.label}
              data-testid={item.testId}
            >
              <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 border rounded-md p-0.5 bg-background flex-shrink-0" data-testid="view-mode-toggle">
          <Toggle
            pressed={viewMode === "edit"}
            onPressedChange={() => setViewMode("edit")}
            size="sm"
            className="h-6 sm:h-7 px-1.5 sm:px-2 data-[state=on]:bg-muted"
            title="Edit only"
            data-testid="view-edit"
          >
            <Maximize2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="text-[10px] sm:text-xs ml-1 hidden sm:inline">Edit</span>
          </Toggle>
          {!isMobile && (
            <Toggle
              pressed={viewMode === "split"}
              onPressedChange={() => setViewMode("split")}
              size="sm"
              className="h-6 sm:h-7 px-1.5 sm:px-2 data-[state=on]:bg-muted"
              title="Split view"
              data-testid="view-split"
            >
              <Columns className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="text-[10px] sm:text-xs ml-1 hidden sm:inline">Split</span>
            </Toggle>
          )}
          <Toggle
            pressed={viewMode === "preview"}
            onPressedChange={() => setViewMode("preview")}
            size="sm"
            className="h-6 sm:h-7 px-1.5 sm:px-2 data-[state=on]:bg-muted"
            title="Preview only"
            data-testid="view-preview"
          >
            <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="text-[10px] sm:text-xs ml-1 hidden sm:inline">Preview</span>
          </Toggle>
        </div>
      </div>

      <div style={{ minHeight }}>
        {viewMode === "edit" && renderEditorPane()}
        
        {viewMode === "preview" && renderPreviewPane()}
        
        {viewMode === "split" && !isMobile && (
          <ResizablePanelGroup direction="horizontal" className="h-full" style={{ minHeight }}>
            <ResizablePanel defaultSize={50} minSize={25}>
              {renderEditorPane()}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={25}>
              {renderPreviewPane()}
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      <div className="px-2 sm:px-3 py-1.5 sm:py-2 border-t bg-muted/30 text-[10px] sm:text-xs text-muted-foreground">
        <span className="hidden sm:inline">Markdown supported · **bold** · *italic* · # heading · - list · [link](url)</span>
        <span className="sm:hidden">**bold** *italic* # heading - list</span>
      </div>
    </div>
  );
}
