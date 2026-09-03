import React from 'react';
import { VisualRichEditor } from '../common/VisualRichEditor';

interface PageRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const PageRichEditor: React.FC<PageRichEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tulis konten naskah halaman di sini... Ketik langsung secara visual atau atur pemformatan penajukan (Paragraf, Penajukan 1, Penajukan 2, Penajukan 3) melalui dropdown toolbar di atas.',
  minHeight = '340px',
}) => {
  return (
    <VisualRichEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      minHeight={minHeight}
      allowPhotoInsert={true}
      showWordStats={true}
    />
  );
};
