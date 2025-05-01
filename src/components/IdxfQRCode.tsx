
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from './ui/button';

interface IdxfQRCodeProps {
  value: string;
  title?: string;
  showCopyButton?: boolean;
  onCopy?: () => void;
  size?: number;
  logoImage?: string;
}

const IdxfQRCode: React.FC<IdxfQRCodeProps> = ({
  value,
  title = "Invite collaborators",
  showCopyButton = true,
  onCopy,
  size = 200,
  logoImage,
}) => {
  return (
    <div className="bg-idxf-lime text-idxf-black p-8 rounded-3xl flex flex-col items-center">
      <h3 className="text-2xl font-bold mb-6">{title}</h3>
      
      <div className="bg-idxf-black p-4 rounded-xl mb-5">
        <QRCodeSVG
          value={value}
          size={size}
          level="H"
          includeMargin={false}
          imageSettings={logoImage ? {
            src: logoImage,
            x: undefined,
            y: undefined,
            height: 30,
            width: 30,
            excavate: true,
          } : undefined}
        />
      </div>
      
      {showCopyButton && (
        <>
          <div className="bg-idxf-black text-white rounded-full py-2 px-4 w-full text-center mb-4 flex items-center justify-center overflow-hidden">
            <div className="truncate">
              {value}
            </div>
          </div>
          <Button
            variant="black"
            onClick={onCopy}
            className="w-full"
          >
            Copy
          </Button>
        </>
      )}
      
      <div className="mt-4 flex items-center">
        <span className="mr-2">Invited:</span>
        <div className="flex">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="w-6 h-6 rounded-full bg-idxf-black -ml-2 first:ml-0 flex items-center justify-center text-xs text-white"
            >
              {i}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IdxfQRCode;
