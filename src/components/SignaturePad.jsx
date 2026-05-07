// src/components/SignaturePad.jsx
import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function SignaturePad({ onSave, onClear, initialSignature }) {
  const sigCanvas = useRef(null);
  const [hasSignature, setHasSignature] = useState(!!initialSignature);

  const clear = () => {
    sigCanvas.current.clear();
    setHasSignature(false);
    onClear?.();
  };

  const save = () => {
    if (sigCanvas.current.isEmpty()) {
      alert("Veuillez dessiner votre signature avant de valider");
      return;
    }
    const signatureData = sigCanvas.current.toDataURL();
    setHasSignature(true);
    onSave?.(signatureData);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-3 bg-white">
      <div className="mb-2">
        <span className="text-xs text-gray-500">Dessinez votre signature dans le cadre ci-dessous :</span>
      </div>
      <SignatureCanvas
        ref={sigCanvas}
        canvasProps={{
          width: 400,
          height: 150,
          className: 'border rounded bg-white w-full',
          style: { width: '100%', height: '120px', touchAction: 'none' }
        }}
        backgroundColor="#ffffff"
        penColor="#0f5b7a"
        velocityFilterWeight={0.7}
        minWidth={1}
        maxWidth={3}
      />
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={clear}
          className="text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Effacer
        </button>
        <button
          type="button"
          onClick={save}
          className="text-xs px-3 py-1.5 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
        >
          Valider la signature
        </button>
      </div>
      {hasSignature && (
        <p className="text-xs text-green-600 mt-2">✓ Signature enregistrée</p>
      )}
    </div>
  );
}