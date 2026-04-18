import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// One Dark or Atom Dark are very close to your screenshot's theme
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FiCopy } from "react-icons/fi"; // bun add react-icons
import { useState } from "react";
interface JsCodeSnippetProps {
  optionIndex: number;
}
export default function AssetOracleSnippet({
  optionIndex,
}: JsCodeSnippetProps) {
  const js = `import AssetOracleSDK from '@assetoracle/sdk';

const client = new AssetOracleSDK({
  apiKey: 'YOUR_API_KEY'
});

// List verified assets
const assets = await client.assets.list({ 
  verification_status: 'verified' 
});

// Get asset details
const asset = await client.assets.get('asset_id');

// Create investment
const investment = await client.investments.create({
  asset_id: 'asset_id',
  tokens: 10
});`;

  const python = `from assetoracle import Client

client = Client(api_key='YOUR_API_KEY')

# List verified assets
assets = client.assets.list(verification_status='verified')

# Get asset details
asset = client.assets.get('asset_id')

# Create investment
investment = client.investments.create(
    asset_id='asset_id',
    tokens=10
)`;

  const curl = `curl https://api.assetoracle.com/v1/assets 
  -H "Authorization: Bearer YOUR_API_KEY" 
  -H "Content-Type: application/json"`;

  const options = [js, python, curl];

  return (
    <div className="relative group rounded-lg overflow-hidden bg-[#0B1221] border border-white/5 shadow-lg max-w-full">
      {/* Copy Button - Positioned exactly like your screenshot */}
      <button
        onClick={() => navigator.clipboard.writeText(options[optionIndex])}
        className="absolute top-4 right-4 p-2 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 transition-all opacity-0 group-hover:opacity-100"
        title="Copy code"
      >
        <FiCopy size={18} />
      </button>

      <div className="p-2 sm:p-4 overflow-x-auto max-w-full">
        <SyntaxHighlighter
          language="javascript"
          style={atomDark}
          customStyle={{
            background: "transparent",
            padding: "1rem",
            fontSize: "0.875rem", // text-sm
            lineHeight: "1.5",
            fontFamily: "JetBrains Mono, Fira Code, monospace",
          }}
        >
          {options[optionIndex]}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
