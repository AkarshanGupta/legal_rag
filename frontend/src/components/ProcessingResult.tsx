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

export const ProcessingResult: React.FC<ProcessingResultProps> = ({
  title,
  result,
  className,
}) => {
  const { showToast } = useApp();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      showToast('success', 'Result copied to clipboard');
    } catch {
      showToast('error', 'Failed to copy to clipboard');
    }
  };

  const downloadAsText = () => {
    const blob = new Blob([result], { type: 'text/plain' });
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
    <Card className={cn("animate-slide-up", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-success/10 text-success">
            <FileText className="w-4 h-4" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={downloadAsText}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
            {result}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};
