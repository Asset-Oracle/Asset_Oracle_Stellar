const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabase");
const axios = require("axios");
const ethers = require("ethers");
const uniqid = require("uniqid");
const multer = require("multer");
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

    // Get all assets owned by this wallet (case-insensitive)
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
  //try {

  const body = req.body;
  const files = req.files;

  const { name, description, estimatedValue, ownerWallet, category, location } =
    body;

  console.log("Form Data:", name, location);
  try {
    const uploadToStorage = async (fileArray, bucketName, folder) => {
      const urls = [];

      for (const file of fileArray) {
        const fileExt = file.originalname.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${ownerWallet}/${name}/${folder}/${fileName}`; // Organize by user wallet

        const { data, error } = await supabase.storage
          .from("asset-files")
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (error) throw error;

        // Get the Public URL
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
    console.log(imageUrls);
    //console.log("Files:", files);

    if (!name || !estimatedValue || !ownerWallet) {
      return res.status(400).json({
        error: "Missing required fields: name, estimatedValue, ownerWallet",
      });
    }

    console.log(`📝 Registering asset: ${name}`);

    // Process images - upload base64 to Supabase Storage if needed
    const processedImages = [];

    for (let i = 0; i < imageUrls.length; i++) {
      const image = imageUrls[i];

      // If image is a URL, keep it as is
      if (
        typeof image === "string" &&
        (image.startsWith("http://") || image.startsWith("https://"))
      ) {
        processedImages.push({ url: image, caption: `Image ${i + 1}` });
        continue;
      }

      // If image has a URL property, use it
      if (
        image.url &&
        (image.url.startsWith("http://") || image.url.startsWith("https://"))
      ) {
        processedImages.push(image);
        continue;
      }

      // If image is base64, upload it to Supabase Storage
      if (
        image.data ||
        (typeof image === "string" && image.includes("base64"))
      ) {
        try {
          const crypto = require("crypto");

          // Get base64 data
          const base64Data = image.data || image;
          const cleanBase64 = base64Data.replace(/^data:.*;base64,/, "");
          const fileBuffer = Buffer.from(cleanBase64, "base64");

          // Generate unique filename
          const timestamp = Date.now();
          const randomStr = crypto.randomBytes(8).toString("hex");
          const fileExtension = image.type?.split("/")[1] || "jpg";
          const uniqueFileName = `${timestamp}-${randomStr}.${fileExtension}`;

          console.log(`📤 Uploading image to Supabase: ${uniqueFileName}`);

          // Upload to Supabase Storage
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

          // Get public URL
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

    // Prepare AI analysis request
    let aiAnalysisResult = {
      riskScore: 78,
      recommendation: "HOLD",
      yieldPotential: 5,
      confidenceLevel: 0.5,
      fraudLikelihood: "MEDIUM",
      investmentSummary:
        "Property analysis based on available data. Market shows rising trends.",
      risks: ["Market volatility"],
      strengths: ["Good location"],
      opportunities: ["Potential appreciation"],
    };

    // Call AI service for analysis
    try {
      if (process.env.AI_SERVICE_URL && location) {
        const aiResponse = await axios.post(
          `${process.env.AI_SERVICE_URL}/api/analyze-complete`,
          {
            address: location.address || "",
            city: location.city || "",
            state: location.state || "",
          },
          { timeout: 30000 },
        );

        if (aiResponse.data && aiResponse.data.investment_analysis) {
          const analysis = aiResponse.data.investment_analysis;
          aiAnalysisResult = {
            riskScore: analysis.score || 78,
            recommendation: analysis.recommendation || "HOLD",
            yieldPotential: 5,
            confidenceLevel:
              aiResponse.data.document_verification?.score / 100 || 0.5,
            fraudLikelihood:
              aiResponse.data.document_verification?.score > 80
                ? "LOW"
                : "MEDIUM",
            investmentSummary:
              analysis.summary || aiAnalysisResult.investmentSummary,
            risks: analysis.risks || aiAnalysisResult.risks,
            strengths: analysis.strengths || aiAnalysisResult.strengths,
            opportunities:
              analysis.opportunities || aiAnalysisResult.opportunities,
          };
        }
      }
    } catch (aiError) {
      console.warn(
        "AI service unavailable, using fallback analysis:",
        aiError.message,
      );
    }

    // Auto-verify the asset
    let verification_status = "VERIFIED";

    // Prepare blockchain data
    const blockchainData = {
      network: "bnb-testnet",
      verified_at: new Date().toISOString(),
      document_hash: require("crypto")
        .createHash("sha256")
        .update(JSON.stringify({ name, ownerWallet, estimatedValue }))
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
          verificationMethod: "automatic",
          aiScore: aiAnalysisResult.riskScore || 78,
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
      console.warn("HCS submission failed (non-critical):", hcsError.message);
    }

    // Insert asset into database
    const { data: newAsset, error } = await supabase
      .from("assets")
      .insert([
        {
          name,
          description,
          estimated_value: estimatedValue,
          owner_wallet: ownerWallet,
          category,
          location: location || {},
          property_details: {},
          images: imageUrls, // Use processed images
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
      `✅ Asset registered with ${processedImages.length} images: ${newAsset.id}`,
    );

    res.status(201).json({
      success: true,
      message: "Asset registered and automatically verified",
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
    console.error("Error registering asset:", error);
    res
      .status(500)
      .json({ error: "Failed to register asset", details: error.message });
  }
});

// POST /api/assets/:id/claim - Claim an unclaimed asset
router.post("/:id/claim", async (req, res) => {
  try {
    const { walletAddress, documents } = req.body;

    if (!walletAddress) {
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

    // Update asset with claim
    const { data: claimedAsset, error: updateError } = await supabase
      .from("assets")
      .update({
        claimed_by: walletAddress,
        claim_status: "CLAIMED",
        claim_documents: documents || [],
        claimed_at: new Date().toISOString(),
        owner_wallet: walletAddress,
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

// POST /api/assets/:id/tokenize - Tokenize verified asset with Hedera HTS
router.post("/:id/tokenize", async (req, res) => {
  try {
    const { tokenSupply, pricePerToken, walletAddress, userSignature } =
      req.body;

    if (
      !tokenSupply ||
      tokenSupply <= 0 ||
      !pricePerToken ||
      !walletAddress ||
      !userSignature
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: tokenSupply, pricePerToken, walletAddress, isMintable, userSignature",
      });
    }
    console.log(tokenSupply, walletAddress, pricePerToken, userSignature);
    const tokenized_data = await TokenizeAsset(
      tokenSupply,
      pricePerToken,
      walletAddress,
      userSignature,
    );
    console.log("Tokenization result: ", tokenized_data);
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

    if (asset.owner_wallet.toLowerCase() !== walletAddress.toLowerCase()) {
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
        tokenized_at: new Date().toISOString(),
        is_tokenized: true,
      })
      .eq("id", req.params.id)
      .select("*");

    console.log(`🪙 Tokenizing asset ${req.params.id} on Hedera`);
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
    console.log(price_per_token, memo, token_number, token_amount);
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
  console.log(hash, evm_wallet_address, stellar_wallet_address, memo);
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
    console.log("!Pending");
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
  console.log("Gate Way", gateway);
  try {
    const data = await getTransaction(hash, gateway);

    if (data[0].toLowerCase() !== wallet_address.toLowerCase()) {
      const { data: updatePayment, error: updatePaymentError } = await supabase
        .from("payments")
        .update({
          status: "FAILED",
        })
        .eq("memo", memo)
        .select()
        .single();
      throw new Error("Invalid sender address");
    }
    if (
      data[1].toLowerCase() !==
      (gateway === "STELLAR"
        ? stellar_wallet.toLowerCase()
        : contractAddress.toLowerCase())
    ) {
      console.log(stellar_wallet.toLowerCase(), contractAddress.toLowerCase());
      const { data: updatePayment, error: updatePaymentError } = await supabase
        .from("payments")
        .update({
          status: "FAILED",
        })
        .eq("memo", memo)
        .select()
        .single();
      throw new Error("Invalid recipient address");
    }
    if (Number(data[3]) < paymentData.eth_amount) {
      const { data: updatePayment, error: updatePaymentError } = await supabase
        .from("payments")
        .update({
          status: "FAILED",
        })
        .eq("memo", memo)
        .select()
        .single();
      throw new Error("Insufficient amount transferred");
    }

    const receipt = await Transfer_Token(
      token_number,
      evm_wallet_address,
      paymentData.token_amount,
    );
    console.log("PayMent Receipt : ", receipt.hash);
    console.log("Updating Payment Info");

    const { data: updatePayment, error: updatePaymentError } = await supabase
      .from("payments")
      .update({
        status: "PAID",
        txHash: receipt.hash,
      })
      .eq("memo", memo);

    if (updatePaymentError) {
      console.log(updatePaymentError);
      return res.status(500).json({
        error: `Error updating payment Info for ${memo}`,
      });
    }
    console.log("Updated Payment Info");

    res.status(201).json({
      data: {
        hash: receipt.hash,
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

// POST /api/assets/:id/verify - Manual verification (if needed)
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
  console.log(tokenSupply, ownerWallet, isMintable, userSignature);
  if (
    tokenSupply <= 0 ||
    !ownerWallet ||
    isMintable === undefined ||
    !userSignature
  ) {
    console.log("Missing required fields in request body");
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
    console.log("Tokenization result: ", data);
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
