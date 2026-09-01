import React from 'react';
import { VisualRichEditor } from '../common/VisualRichEditor';

interface NewsRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const NewsRichEditor: React.FC<NewsRichEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tuliskan naskah isi artikel berita di sini... Ketik langsung secara visual atau ubah format penajukan (Paragraf, Penajukan 1, Penajukan 2, Penajukan 3) melalui menu toolbar di atas.',
  minHeight = '380px',
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

