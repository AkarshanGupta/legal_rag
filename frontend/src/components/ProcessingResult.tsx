import React from 'react';
import { Copy, Download, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

interface ProcessingResultProps {
  title: string;
  result: string;
  className?: string;
}

// Function to parse markdown-like formatting and convert to styled elements
const parseFormattedText = (text: string) => {
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;

  // Replace **text** with bold
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  const matches: Array<{ start: number; end: number; text: string }> = [];

  while ((match = boldRegex.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[1],
    });
  }

  matches.forEach((m, i) => {
    parts.push(text.slice(lastIndex, m.start));
    parts.push(
      <strong key={`bold-${i}`} className="font-semibold text-foreground">
        {m.text}
      </strong>
    );
    lastIndex = m.end;
  });
  parts.push(text.slice(lastIndex));

  // Now remove single asterisks from the entire result
  return parts.map((part, i) =>
    typeof part === 'string' ? (
      <React.Fragment key={`text-${i}`}>
        {part.replace(/\*/g, '')}
      </React.Fragment>
    ) : (
      part
    )
  );
};

export const ProcessingResult: React.FC<ProcessingResultProps> = ({
  title,
  result,
  className,
}) => {
  const { showToast } = useApp();

  const copyToClipboard = async () => {
    try {
      // Copy the cleaned text without asterisks
      const cleanedText = result.replace(/\*\*/g, '').replace(/\*/g, '');
      await navigator.clipboard.writeText(cleanedText);
      showToast('success', 'Result copied to clipboard');
    } catch {
      showToast('error', 'Failed to copy to clipboard');
    }
  };

  const downloadAsText = () => {
    // Download the cleaned text without asterisks
    const cleanedText = result.replace(/\*\*/g, '').replace(/\*/g, '');
    const blob = new Blob([cleanedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-result.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('success', 'File downloaded');
  };

  return (
    <Card className={cn("animate-slide-up flex flex-col h-full shadow-md border-0", className)}>
      <CardHeader className="pb-2 bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-950/30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={copyToClipboard}
              className="h-8 w-8"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={downloadAsText}
              className="h-8 w-8"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-4">
        <div className="h-full overflow-y-auto text-sm leading-relaxed text-foreground/90 space-y-3">
          {result.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="whitespace-pre-wrap break-words">
              {parseFormattedText(paragraph)}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
