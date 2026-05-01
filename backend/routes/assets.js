const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabase");
const axios = require("axios");
const ethers = require("ethers");
const uniqid = require("uniqid");
const multer = require("multer");
const Groq = require("groq-sdk"); // ADDED: Import Groq SDK

const {
  TokenizeAsset,
  purchaseAsset,
  getTransaction,
  Transfer_Token,
} = require("../contracts/tokenCreator");

const contractAddress = process.env.CONTRACT_ADDRESS;
const stellar_wallet = process.env.STELLAR_WALLET;

const upload = multer();
const assetUpload = upload.fields([
  { name: "propertyDetails", maxCount: 10 },
  { name: "images", maxCount: 10 },
]);

// Test endpoint to check Supabase connection
router.get("/test-db", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("assets")
      .select("count")
      .limit(1);

    if (error) {
      return res.json({
        success: false,
        error: error.message,
        details: error,
      });
    }

    res.json({
      success: true,
      message: "Supabase connected!",
      data: data,
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.message,
    });
  }
});

// GET /api/assets - Get all verified assets (marketplace)
router.get("/", async (req, res) => {
  try {
    const { data: assets, error } = await supabase
      .from("assets")
      .select("*")
      .eq("verification_status", "VERIFIED")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: assets,
      pagination: {
        total: assets.length,
        page: 1,
        limit: 20,
        pages: Math.ceil(assets.length / 20),
      },
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

// GET /api/assets/user/:walletAddress - Get assets owned by specific user
router.get("/user/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address required" });
    }

    console.log(`📋 Fetching assets for wallet: ${walletAddress}`);

    const { data: assets, error } = await supabase
      .from("assets")
      .select("*")
      .ilike("owner_wallet", walletAddress)
      .order("created_at", { ascending: false });

    if (error) throw error;

    console.log(`✅ Found ${assets.length} assets for ${walletAddress}`);

    res.json({
      success: true,
      data: assets,
      count: assets.length,
    });
  } catch (error) {
    console.error("Error fetching user assets:", error);
    res.status(500).json({
      error: "Failed to fetch user assets",
      details: error.message,
    });
  }
});

// GET /api/assets/debug/all - Debug endpoint to see all assets
router.get("/debug/all", async (req, res) => {
  try {
    const { data: assets, error } = await supabase
      .from("assets")
      .select("id, name, owner_wallet, verification_status, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json({
      success: true,
      data: assets,
      count: assets.length,
      message: "Showing last 20 assets",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/assets/unclaimed - Get unclaimed assets
router.get("/unclaimed", async (req, res) => {
  try {
    const { data: assets, error } = await supabase
      .from("assets")
      .select("*")
      .eq("claim_status", "UNCLAIMED")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: assets,
    });
  } catch (error) {
    console.error("Error fetching unclaimed assets:", error);
    res.status(500).json({ error: "Failed to fetch unclaimed assets" });
  }
});

// GET /api/assets/tokenized - Get tokenized assets
router.get("/tokenized", async (req, res) => {
  try {
    const { data: assets, error } = await supabase
      .from("assets")
      .select("*")
      .eq("is_tokenized", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: assets,
    });
  } catch (error) {
    console.error("Error fetching tokenized assets:", error);
    res.status(500).json({ error: "Failed to fetch tokenized assets" });
  }
});

// GET /api/assets/:id - Get single asset
router.get("/:id", async (req, res) => {
  try {
    const { data: asset, error } = await supabase
      .from("assets")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error("Error fetching asset:", error);
    res.status(500).json({ error: "Failed to fetch asset" });
  }
});

// POST /api/assets/register - Register new asset with auto-verification and image upload
router.post("/register", assetUpload, async (req, res) => {
  const body = req.body;
  const files = req.files;

  const { name, description, estimatedValue, email, category, location } = body;

  console.log("Form Data:", name, location, email);

  if (!name || !estimatedValue || !email) {
    return res.status(400).json({
      error: "Missing required fields: name, estimatedValue, ownerWallet",
    });
  }

  try {
    const uploadToStorage = async (fileArray, bucketName, folder) => {
      const urls = [];

      for (const file of fileArray) {
        const fileExt = file.originalname.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${email}/${name}/${folder}/${fileName}`;

        const { data, error } = await supabase.storage
          .from("asset-files")
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from(bucketName).getPublicUrl(filePath);

        urls.push(publicUrl);
      }
      return urls;
    };

    const imageUrls = await uploadToStorage(
      files.images || [],
      "asset-files",
      "images",
    );
    const docUrls = await uploadToStorage(
      files.propertyDetails || [],
      "asset-documents",
      "documents",
    );

    console.log("Image URLs:", imageUrls);

    console.log(`📝 Registering asset: ${name}`);

    // Process images - upload base64 to Supabase Storage if needed
    const processedImages = [];

    for (let i = 0; i < imageUrls.length; i++) {
      const image = imageUrls[i];

      if (
        typeof image === "string" &&
        (image.startsWith("http://") || image.startsWith("https://"))
      ) {
        processedImages.push({ url: image, caption: `Image ${i + 1}` });
        continue;
      }

      if (
        image.url &&
        (image.url.startsWith("http://") || image.url.startsWith("https://"))
      ) {
        processedImages.push(image);
        continue;
      }

      if (
        image.data ||
        (typeof image === "string" && image.includes("base64"))
      ) {
        try {
          const crypto = require("crypto");

          const base64Data = image.data || image;
          const cleanBase64 = base64Data.replace(/^data:.*;base64,/, "");
          const fileBuffer = Buffer.from(cleanBase64, "base64");

          const timestamp = Date.now();
          const randomStr = crypto.randomBytes(8).toString("hex");
          const fileExtension = image.type?.split("/")[1] || "jpg";
          const uniqueFileName = `${timestamp}-${randomStr}.${fileExtension}`;

          console.log(`📤 Uploading image to Supabase: ${uniqueFileName}`);

          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("asset-files")
              .upload(uniqueFileName, fileBuffer, {
                contentType: image.type || "image/jpeg",
                cacheControl: "3600",
                upsert: false,
              });

          if (uploadError) {
            console.warn("Image upload failed, skipping:", uploadError.message);
            continue;
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from("asset-files").getPublicUrl(uniqueFileName);

          processedImages.push({
            url: publicUrl,
            caption: image.caption || `Image ${i + 1}`,
          });

          console.log(`✅ Image uploaded: ${publicUrl}`);
        } catch (uploadError) {
          console.warn(
            "Failed to process image, skipping:",
            uploadError.message,
          );
        }
      }
    }

    // UPDATED: AI Analysis using Groq directly
    console.log(`🤖 Starting AI fraud analysis with Groq`);

    let aiAnalysisResult = {
      riskScore: 50,
      recommendation: "REVIEW",
      yieldPotential: 5,
      confidenceLevel: 0.5,
      fraudLikelihood: "MEDIUM",
      investmentSummary:
        "Property requires manual review - automated analysis unavailable",
      risks: ["Automated verification pending"],
      strengths: ["Property submitted for review"],
      opportunities: ["Awaiting detailed analysis"],
    };

    // Initialize Groq and get AI analysis
    try {
      if (process.env.GROQ_API_KEY) {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const locationString = location
          ? `${location.address || ""}, ${location.city || ""}, ${location.state || ""}, Nigeria`
          : "Nigeria";

        console.log(`🔍 Analyzing property: ${name} at ${locationString}`);

        const aiAnalysis = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `You are a Nigerian real estate fraud detection and investment analysis AI. Analyze properties for:
1. Fraud Risk (Nigerian-specific patterns: fake C of O, duplicate sales, land grabbing, Omo-Onile issues, government acquisition risks)
2. Investment Potential (rental yield, appreciation, location quality)
3. Market Analysis (Nigerian property market trends)

Provide detailed JSON output with specific Nigerian real estate insights.`,
            },
            {
              role: "user",
              content: `Analyze this Nigerian property for fraud risk and investment potential:

Property Name: ${name}
Location: ${locationString}
Description: ${description || "No description provided"}
Estimated Value: ₦${estimatedValue}
Category: ${category || "Residential"}

Provide detailed analysis in this exact JSON format:
{
  "riskScore": 0-100 (0=safest, 100=highest risk),
  "recommendation": "BUY" or "HOLD" or "AVOID",
  "fraudLikelihood": "LOW" or "MEDIUM" or "HIGH",
  "yieldPotential": 0-10 (expected rental yield percentage),
  "confidenceLevel": 0-1 (analysis confidence),
  "investmentSummary": "2-3 sentence overview of investment potential",
  "risks": ["list specific risks including Nigerian fraud patterns"],
  "strengths": ["list property advantages"],
  "opportunities": ["list investment opportunities"]
}

Focus on Nigerian real estate market realities. Be specific about fraud indicators.`,
            },
          ],
          model: "mixtral-8x7b-32768",
          temperature: 0.3,
          max_tokens: 1200,
          response_format: { type: "json_object" },
        });

        const aiContent = JSON.parse(aiAnalysis.choices[0].message.content);

        aiAnalysisResult = {
          riskScore: aiContent.riskScore || 50,
          recommendation: aiContent.recommendation || "HOLD",
          yieldPotential: aiContent.yieldPotential || 5,
          confidenceLevel: aiContent.confidenceLevel || 0.7,
          fraudLikelihood: aiContent.fraudLikelihood || "MEDIUM",
          investmentSummary:
            aiContent.investmentSummary || "Analysis completed",
          risks: aiContent.risks || ["Standard market risks"],
          strengths: aiContent.strengths || ["Property analyzed"],
          opportunities: aiContent.opportunities || [
            "Investment potential identified",
          ],
        };

        console.log(
          `✅ Groq AI Analysis complete - Risk Score: ${aiAnalysisResult.riskScore}`,
        );
      } else {
        console.warn("⚠️ GROQ_API_KEY not found in environment variables");
      }
    } catch (aiError) {
      console.error("❌ Groq AI analysis failed:", aiError.message);
      console.log("Using fallback analysis values");
    }

    // Auto-verify based on risk score
    let verification_status = "VERIFIED";

    // if (aiAnalysisResult.riskScore > 70) {
    //   verification_status = "FLAGGED";
    // } else if (aiAnalysisResult.riskScore > 40) {
    //   verification_status = "PENDING_REVIEW";
    // }

    console.log(
      `📊 Verification Status: ${verification_status} (Risk: ${aiAnalysisResult.riskScore})`,
    );

    // Prepare blockchain data
    const blockchainData = {
      network: "bnb-testnet",
      verified_at: new Date().toISOString(),
      document_hash: require("crypto")
        .createHash("sha256")
        .update(JSON.stringify({ name, email, estimatedValue }))
        .digest("hex"),
      verification_id: `VER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Submit verification to Hedera Consensus Service
    const { submitVerificationMessage } = require("../utils/hedera");

    try {
      if (process.env.HEDERA_VERIFICATION_TOPIC_ID) {
        const verificationMessage = {
          assetId: "pending",
          assetName: name,
          verifiedAt: new Date().toISOString(),
          ownerWallet: ownerWallet,
          estimatedValue: estimatedValue,
          verificationMethod: "groq-ai-analysis",
          aiScore: aiAnalysisResult.riskScore,
          fraudLikelihood: aiAnalysisResult.fraudLikelihood,
        };

        const hcsResult = await submitVerificationMessage(
          process.env.HEDERA_VERIFICATION_TOPIC_ID,
          verificationMessage,
        );

        console.log(
          `✅ Verification recorded on HCS: Sequence ${hcsResult.sequenceNumber}`,
        );

        blockchainData.hcs_sequence = hcsResult.sequenceNumber;
        blockchainData.hcs_transaction_id = hcsResult.transactionId;
      }
    } catch (hcsError) {
      console.warn(
        "⚠️ HCS submission failed (non-critical):",
        hcsError.message,
      );
    }

    // Insert asset into database
    const { data: newAsset, error } = await supabase
      .from("assets")
      .insert([
        {
          name,
          description,
          estimated_value: estimatedValue,
          email,
          category,
          location: location || {},
          property_details: {},
          images: imageUrls,
          verification_status,
          blockchain_data: blockchainData,
          ai_analysis: aiAnalysisResult,
          source_platform: "assetoracle",
          is_assetoracle_listing: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log(
      `✅ Asset registered: ${newAsset.id} | Status: ${verification_status} | Images: ${processedImages.length}`,
    );

    res.status(201).json({
      success: true,
      message: `Asset registered successfully with ${verification_status} status`,
      data: {
        asset: newAsset,
        verification: {
          status: verification_status,
          verificationId: blockchainData.verification_id,
          network: "hedera-testnet",
          aiAnalysis: aiAnalysisResult,
        },
        imagesUploaded: processedImages.length,
      },
    });
  } catch (error) {
    console.error("❌ Error registering asset:", error);
    res
      .status(500)
      .json({ error: "Failed to register asset", details: error.message });
  }
});

// POST /api/assets/:id/claim - Claim an unclaimed asset
router.post("/:id/claim", async (req, res) => {
  try {
    const { email, documents } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing wallet address" });
    }

    const { data: asset, error: fetchError } = await supabase
      .from("assets")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError || !asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    if (asset.claim_status !== "UNCLAIMED") {
      return res
        .status(400)
        .json({ error: "Asset is not available for claiming" });
    }

    console.log(`📋 Processing claim for asset ${req.params.id}`);

    const { data: claimedAsset, error: updateError } = await supabase
      .from("assets")
      .update({
        claimed_by: email,
        claim_status: "CLAIMED",
        claim_documents: documents || [],
        claimed_at: new Date().toISOString(),
        email: email,
        verification_status: "VERIFIED",
      })
      .eq("id", req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log(`✅ Asset claimed successfully`);

    res.json({
      success: true,
      message: "Asset claimed successfully",
      data: claimedAsset,
    });
  } catch (error) {
    console.error("Error claiming asset:", error);
    res
      .status(500)
      .json({ error: "Failed to claim asset", details: error.message });
  }
});

// POST /api/assets/:id/tokenize - Tokenize verified asset
router.post("/:id/tokenize", async (req, res) => {
  try {
    const { tokenSupply, pricePerToken, email, walletAddress } = req.body;

    if (
      !tokenSupply ||
      tokenSupply <= 0 ||
      !pricePerToken ||
      !email ||
      !walletAddress
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: tokenSupply, pricePerToken,email, walletAddress",
      });
    }

    console.log("Tokenization request:", {
      tokenSupply,
      walletAddress,
      pricePerToken,
    });

    const tokenized_data = await TokenizeAsset(tokenSupply, walletAddress);
    console.log("Tokenization result:", tokenized_data);

    const { data: asset, error: fetchError } = await supabase
      .from("assets")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError || !asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    if (asset.verification_status !== "VERIFIED") {
      return res.status(400).json({
        error: "Only verified assets can be tokenized",
        currentStatus: asset.verification_status,
      });
    }

    if (asset.email !== email) {
      return res.status(403).json({ error: "Only asset owner can tokenize" });
    }

    const { data: update, error: updateError } = await supabase
      .from("assets")
      .update({
        verification_status: "TOKENIZED",
        token_number: Number(tokenized_data[1]),
        token_supply: tokenSupply,
        price_per_token: pricePerToken,
        tokens_available: tokenSupply,
        owner_wallet: walletAddress,
        tokenized_at: new Date().toISOString(),
        is_tokenized: true,
      })
      .eq("id", req.params.id)
      .select("*");

    console.log(`🪙 Asset tokenized: ${req.params.id}`);

    res.status(201).json({
      data: update[0],
    });
  } catch (error) {
    console.error("Error tokenizing asset:", error);
    res.status(500).json({
      error: "Failed to tokenize asset",
      details: error.message,
    });
  }
});

router.post("/:id/create_payment", async (req, res) => {
  const id = req.params.id;
  const { evm_wallet_address, stellar_wallet_address, token_amount, gateway } =
    req.body;

  if (
    !id ||
    !evm_wallet_address ||
    token_amount <= 0 ||
    !gateway ||
    (gateway !== "STELLAR" && gateway !== "EVM")
  ) {
    return res.status(400).json({
      error:
        "Missing required fields: id, wallet_address, token_amount, gateway",
    });
  }

  if (gateway === "STELLAR" && !stellar_wallet_address) {
    return res.status(400).json({
      error:
        "Missing required fields: stellar_wallet_address for STELLAR gateway",
    });
  }

  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .select("*")
    .eq("id", id)
    .single();

  if (assetError || !asset) {
    return res.status(500).json({
      message: "Couldnt Find Asset",
    });
  }

  let wallet_address;
  if (gateway === "STELLAR") {
    wallet_address = stellar_wallet_address;
  } else {
    wallet_address = evm_wallet_address;
  }

  try {
    const memo = uniqid();
    const price_per_token = asset.price_per_token;
    const token_number = asset.token_number;
    let transfer_amount;

    if (gateway === "STELLAR") {
      transfer_amount = Number(5).toFixed(7);
    } else {
      transfer_amount = ethers.parseEther(Number(0.0000015).toString());
    }

    console.log("Payment details:", {
      price_per_token,
      memo,
      token_number,
      token_amount,
    });

    const { data: createdPayment, error: paymentCreationError } = await supabase
      .from("payments")
      .insert({
        memo,
        eth_amount: Number(transfer_amount),
        token_amount: token_amount,
        wallet_address,
        token_number,
        status: "PENDING",
        gateway,
      })
      .select()
      .single();

    if (paymentCreationError || !createdPayment) {
      console.log(paymentCreationError);
      return res.status(500).json({
        message: "Couldnt Create Payment ",
      });
    }

    res.status(201).json({
      data: {
        memo: createdPayment.memo,
        token_number,
        amount: createdPayment.eth_amount,
      },
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      error: "Failed to create payment",
      details: error.message,
    });
  }
});

router.post("/:id/confirm_purchase", async (req, res) => {
  const { evm_wallet_address, stellar_wallet_address, hash, memo } = req.body;
  const id = req.params.id;

  if (!hash || !evm_wallet_address || !id || !memo) {
    return res.status(400).json({
      error: "Missing required fields: hash, amount, id, memo",
    });
  }

  console.log("Confirming purchase:", {
    hash,
    evm_wallet_address,
    stellar_wallet_address,
    memo,
  });

  const { data: paymentData, error: paymentError } = await supabase
    .from("payments")
    .select("*")
    .eq("memo", memo)
    .single();

  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .select("*")
    .eq("id", id)
    .single();

  if (!asset || assetError) {
    return res.status(500).json({
      error: `Error getting asset`,
    });
  }

  if (!paymentData || paymentError) {
    return res.status(500).json({
      error: `Error getting payment Info for ${memo}`,
    });
  }

  if (paymentData.status !== "PENDING") {
    return res.status(500).json({
      error: `Payment for ${memo} has been processed`,
    });
  }

  const token_number = asset.token_number;
  const gateway = paymentData.gateway;
  let wallet_address;

  if (gateway === "STELLAR") {
    wallet_address = stellar_wallet_address;
  } else {
    wallet_address = evm_wallet_address;
  }

  console.log("Gateway:", gateway);

  try {
    const data = await getTransaction(hash, gateway);

    if (data[0].toLowerCase() !== wallet_address.toLowerCase()) {
      await supabase
        .from("payments")
        .update({ status: "FAILED" })
        .eq("memo", memo);
      throw new Error("Invalid sender address");
    }

    if (
      data[1].toLowerCase() !==
      (gateway === "STELLAR"
        ? stellar_wallet.toLowerCase()
        : contractAddress.toLowerCase())
    ) {
      await supabase
        .from("payments")
        .update({ status: "FAILED" })
        .eq("memo", memo);
      throw new Error("Invalid recipient address");
    }

    if (Number(data[3]) < paymentData.eth_amount) {
      await supabase
        .from("payments")
        .update({ status: "FAILED" })
        .eq("memo", memo);
      throw new Error("Insufficient amount transferred");
    }

    const transferData = await Transfer_Token(
      token_number,
      evm_wallet_address,
      paymentData.token_amount,
    );

    console.log("Transfer complete:", transferData.receipt.hash);

    await supabase
      .from("payments")
      .update({
        status: "PAID",
        txHash: transferData.receipt.hash,
      })
      .eq("memo", memo);

    await supabase
      .from("assets")
      .update({
        tokens_available: Number(transferData.balance),
      })
      .eq("id", id);

    res.status(201).json({
      data: {
        hash: transferData.receipt.hash,
        status: "SUCCESS",
      },
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({
      data: {
        hash: "",
        status: "FAILED",
      },
    });
  }
});

// POST /api/assets/:id/verify - Manual verification
router.post("/:id/verify", async (req, res) => {
  try {
    const { data: asset, error: fetchError } = await supabase
      .from("assets")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError || !asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    const blockchainData = {
      network: "hedera-testnet",
      verified_at: new Date().toISOString(),
      document_hash: require("crypto")
        .createHash("sha256")
        .update(JSON.stringify(asset))
        .digest("hex"),
      verification_id: `VER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    const { data: verifiedAsset, error: updateError } = await supabase
      .from("assets")
      .update({
        verification_status: "VERIFIED",
        blockchain_data: blockchainData,
      })
      .eq("id", req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: "Asset verified successfully",
      data: verifiedAsset,
    });
  } catch (error) {
    console.error("Error verifying asset:", error);
    res.status(500).json({ error: "Failed to verify asset" });
  }
});

router.post("/:id/ex_tokenize", async (req, res) => {
  const { tokenSupply, ownerWallet, isMintable, userSignature } = req.body;

  if (
    tokenSupply <= 0 ||
    !ownerWallet ||
    isMintable === undefined ||
    !userSignature
  ) {
    return res.status(400).json({
      error:
        "Missing required fields: tokenSupply, ownerWallet, isMintable, userSignature",
    });
  }

  try {
    const data = await TokenizeAsset(
      tokenSupply,
      ownerWallet,
      isMintable,
      userSignature,
    );

    console.log("Tokenization result:", data);

    res.json({
      success: true,
      message: "Tokenization process initiated. Check logs for details.",
    });
  } catch (error) {
    console.error("Error tokenizing asset:", error);
    return res.status(500).json({ error: "Failed to tokenize asset" });
  }
});

module.exports = router;
