import React, { useState, useRef } from 'react';
import { FileDown, RefreshCw, Copy, Check } from 'lucide-react';
import dynamic from 'next/dynamic';

const NoritoApp = () => {
  const [inputText, setInputText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [copied, setCopied] = useState(false);
  const pdfRef = useRef(null);

  // ひらがなから万葉仮名への変換マップ
  const hiraganaToManyogana = {
    'あ': '阿', 'い': '伊', 'う': '宇', 'え': '衣', 'お': '於',
    'か': '加', 'き': '岐', 'く': '久', 'け': '介', 'こ': '己',
    'さ': '佐', 'し': '之', 'す': '須', 'せ': '世', 'そ': '曽',
    'た': '多', 'ち': '知', 'つ': '都', 'て': '天', 'と': '止',
    'な': '奈', 'に': '尓', 'ぬ': '奴', 'ね': '祢', 'の': '乃',
    'は': '波', 'ひ': '比', 'ふ': '不', 'へ': '部', 'ほ': '保',
    'ま': '末', 'み': '美', 'む': '牟', 'め': '米', 'も': '毛',
    'や': '也', 'ゆ': '由', 'よ': '与',
    'ら': '良', 'り': '利', 'る': '流', 'れ': '礼', 'ろ': '呂',
    'わ': '和', 'ゐ': '為', 'ゑ': '恵', 'を': '遠', 'ん': '无',
    'が': '我', 'ぎ': '宜', 'ぐ': '具', 'げ': '宜', 'ご': '期',
    'ざ': '射', 'じ': '自', 'ず': '受', 'ぜ': '是', 'ぞ': '曾',
    'だ': '陀', 'ぢ': '遅', 'づ': '豆', 'で': '弖', 'ど': '度',
    'ば': '婆', 'び': '備', 'ぶ': '夫', 'べ': '辺', 'ぼ': '煩',
    'ぱ': '波', 'ぴ': '比', 'ぷ': '布', 'ぺ': '倍', 'ぽ': '保',
  };

  const convertToManyogana = (text) => {
    let result = '';
    let isKanji = false;
    let buffer = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const code = char.charCodeAt(0);

      if ((code >= 0x4E00 && code <= 0x9FFF) || 
          (code >= 0x3400 && code <= 0x4DBF)) {
        if (!isKanji && buffer) {
          result += convertHiraganaBlock(buffer);
          buffer = '';
        }
        result += char;
        isKanji = true;
      }
      else if (code >= 0x3040 && code <= 0x309F) {
        isKanji = false;
        buffer += char;
      }
      else {
        if (buffer) {
          result += convertHiraganaBlock(buffer);
          buffer = '';
        }
        result += char;
        isKanji = false;
      }
    }

    if (buffer) {
      result += convertHiraganaBlock(buffer);
    }

    return result;
  };

  const convertHiraganaBlock = (hiragana) => {
    let converted = '';
    for (let char of hiragana) {
      const manyogana = hiraganaToManyogana[char] || char;
      converted += `<span class="text-sm align-text-top">${manyogana}</span>`;
    }
    return converted;
  };

  const reverseConvert = (text) => {
    let result = '';
    const reverseMap = {};
    
    for (let [key, value] of Object.entries(hiraganaToManyogana)) {
      reverseMap[value] = key;
    }

    for (let char of text) {
      result += reverseMap[char] || char;
    }

    return result;
  };

  const handleConvert = () => {
    const converted = convertToManyogana(inputText);
    setConvertedText(converted);
  };

  const handleReverseConvert = () => {
    const reversed = reverseConvert(convertedText);
    setInputText(reversed);
  };

  const handleCopy = async () => {
    const textOnly = convertedText.replace(/<[^>]*>/g, '');
    await navigator.clipboard.writeText(textOnly);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textOnly = convertedText.replace(/<[^>]*>/g, '');
    const element = document.createElement('a');
    const file = new Blob([textOnly], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = '祝詞.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrintPDF = () => {
  if (!convertedText) return;
  
  // 印刷用のウィンドウを作成
  const printWindow = window.open('', '_blank');
  const cleanText = convertedText.replace(/class="text-sm align-text-top"/g, 'style="font-size: 0.7em; vertical-align: top;"');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>祝詞</title>
      <style>
        @media print {
          @page {
            size: A4 portrait;
            margin: 20mm;
          }
        }
        body {
          margin: 0;
          padding: 20px;
          font-family: "ヒラギノ明朝 Pro", "Hiragino Mincho Pro", "Yu Mincho", "YuMincho", serif;
          writing-mode: vertical-rl;
          text-orientation: upright;
          font-size: 20px;
          line-height: 2.5;
          background: #fffbf0;
          min-height: 100vh;
        }
      </style>
    </head>
    <body>
      ${cleanText}
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
};
    const canvas = await html2canvas(pdfRef.current, {
      scale: 3,
      backgroundColor: '#fffbf0',
      logging: false,
      useCORS: true
    });

    // スタイルを元に戻す
    pdfRef.current.style.cssText = originalStyle;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('祝詞.pdf');
  } catch (error) {
    console.error('PDF生成エラー:', error);
    alert('PDF生成に失敗しました。');
  }
};

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('祝詞.pdf');
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDF生成に失敗しました。');
    }
  };

  const handlePrintA3 = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            writing-mode: vertical-rl;
            text-orientation: upright;
            font-family: serif;
            font-size: 24px;
            line-height: 2.5;
            padding: 20mm;
          }
          .print-area .text-sm {
            font-size: 16px;
            vertical-align: top;
          }
          @page {
            size: A3 landscape;
            margin: 10mm;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="border-b-4 border-amber-600 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 text-center">祝詞作成支援</h1>
            <p className="text-center text-gray-600 mt-2">万葉仮名変換システム</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                入力テキスト（漢字・ひらがな）
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-96 p-4 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none font-serif text-lg"
                placeholder="祝詞の本文を入力してください。&#10;&#10;例：&#10;掛けまくも畏き&#10;伊邪那岐大神&#10;筑紫の日向の..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                変換結果（万葉仮名）
              </label>
              <div
                ref={pdfRef}
                className="w-full h-96 p-4 border-2 border-gray-300 rounded-lg font-serif text-lg bg-amber-50 overflow-auto print-area"
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'upright'
                }}
                dangerouslySetInnerHTML={{ __html: convertedText }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6 justify-center">
            <button
              onClick={handleConvert}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center gap-2 font-semibold shadow-md"
            >
              <RefreshCw size={20} />
              万葉仮名に変換
            </button>

            <button
              onClick={handleReverseConvert}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-semibold shadow-md"
            >
              <RefreshCw size={20} className="transform rotate-180" />
              逆変換
            </button>

            <button
              onClick={handleCopy}
              disabled={!convertedText}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-semibold shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? 'コピー完了' : 'コピー'}
            </button>

            <button
              onClick={handleDownload}
              disabled={!convertedText}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2 font-semibold shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <FileDown size={20} />
              TXT
            </button>

            <button
              onClick={handlePrintPDF}
              disabled={!convertedText}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 font-semibold shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <FileDown size={20} />
              PDF出力
            </button>

            <button
              onClick={handlePrintA3}
              disabled={!convertedText}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-semibold shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <FileDown size={20} />
              A3印刷
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-bold text-gray-800 mb-2">印刷について</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li><strong>PDF出力:</strong> 画面表示そのままをPDFファイルで保存</li>
              <li><strong>A3印刷:</strong> ブラウザの印刷ダイアログが開きます。用紙サイズをA3、横向きに設定してください</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">使い方</h2>
          <div className="space-y-3 text-gray-700">
            <p><strong>1. 入力:</strong> 左側のテキストエリアに祝詞の本文を入力します</p>
            <p><strong>2. 変換:</strong> 「万葉仮名に変換」ボタンをクリックすると、ひらがな部分が万葉仮名に変換されます</p>
            <p><strong>3. 逆変換:</strong> 万葉仮名から現代仮名遣いに戻すことができます</p>
            <p><strong>4. 保存:</strong> コピー、TXT、PDF、印刷など、お好みの方法で保存できます</p>
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-gray-600">
              <strong>注意:</strong> このアプリは基本的な万葉仮名変換機能を提供します。
              複数の万葉仮名表記がある場合、一般的なものを使用しています。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoritoApp;
