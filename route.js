import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { auth, authorize } from "./middleware/auth.js";
import { sendEmail } from "./lib/email.js";
import User from "./models/user.js";
import ColdStorage from "./models/cold-storage.js";
import Compartment from "./models/compartment.js";
import Inventory from "./models/inventory.js";

const router = express.Router();

const generateOTP = async (user) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.emailVerificationOTP = await bcrypt.hash(otp, 8);
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  return otp;
};

router.post("/users/register", async (req, res) => {
  try {
    const { email, password, phoneNumber, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);

    const user = new User({
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      isApproved: role === "customer",
      isEmailVerified: false,
    });

    await user.save();

    const otp = await generateOTP(user);

    if (user.role === "customer" || user.role === "storage") {
      try {
        await sendEmail({
          body: `Your verification code is ${otp}. This code will expire in 10 minutes.`,
          subject: "Email Verification",
          to: email,
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
      }
    }

    const token = jwt.sign(
      { _id: user._id.toString() },
      "YSyzETSqDyh6RTe0WldN7ndqSQe7VYCyx0qk3ko62PI=",
    );

    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isApproved: user.isApproved,
        isEmailVerified: user.isEmailVerified,
      },
      token,
      message: "Please check your email for verification code.",
    });
  } catch (e) {
    console.error("Registration error:", e);
    res.status(400).json({
      error: e.message || "Failed to register user",
    });
  }
});

router.post("/users/verify-email", auth, async (req, res) => {
  try {
    const { otp } = req.body;
    const user = req.user;

    if (user.isEmailVerified) {
      return res.status(400).send({ error: "Email already verified" });
    }

    if (!user.emailVerificationOTP || !user.otpExpiry) {
      return res
        .status(400)
        .send({ error: "No OTP found. Please request a new one." });
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(400).send({ error: "OTP has expired" });
    }

    const isMatch = await bcrypt.compare(otp, user.emailVerificationOTP);
    if (!isMatch) {
      return res.status(400).send({ error: "Invalid OTP" });
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.otpExpiry = undefined;
    await user.save();

    await sendEmail({
      body: `Your email has been verified successfully.`,
      subject: "Email Verification",
      to: user.email,
    });

    res.send({ message: "Email verified successfully" });
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

router.post("/users/resend-verification", auth, async (req, res) => {
  try {
    const user = req.user;

    if (user.isEmailVerified) {
      return res.status(400).send({ error: "Email already verified" });
    }

    const otp = await user.generateEmailVerificationOTP();
    await sendEmail({
      body: `Your new verification code is: ${otp}. This code will expire in 10 minutes.`,
      subject: "Email Verification",
      to: user.email,
    });

    res.send({ message: "New verification code sent to your email" });
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid login credentials");
    }
    const token = jwt.sign(
      { _id: user._id.toString() },
      "YSyzETSqDyh6RTe0WldN7ndqSQe7VYCyx0qk3ko62PI=",
    );
    res.send({ user, token });
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

router.post(
  "/cold-storage/register",
  auth,
  authorize(["storage"]),
  async (req, res) => {
    try {
      const coldStorage = new ColdStorage({
        ...req.body,
        admin: req.user._id,
      });
      await coldStorage.save();
      res.status(201).send(coldStorage);
    } catch (e) {
      res.status(400).send(e);
    }
  },
);

router.post(
  "/cold-storage/:id/approve",
  auth,
  authorize(["super"]),
  async (req, res) => {
    try {
      const coldStorage = await ColdStorage.findById(req.params.id);
      if (!coldStorage) {
        return res.status(404).json({ message: "Cold storage not found" });
      }
      coldStorage.isApproved = req.body.approve;
      if (!req.body.approve) {
        coldStorage.rejectionHistory.push({
          reason: req.body.reason,
          date: new Date(),
        });
      } else {
        const admin = await User.findById(coldStorage.admin);
        if (!admin) {
          return res.status(404).json({ message: "Admin user not found" });
        }

        await sendEmail({
          body: `Your cold storage has been approved by ${
            admin.name || "admin"
          }.`,
          subject: "Cold Storage Approval",
          to: admin.email,
        });
      }
      await coldStorage.save();
      res.send(coldStorage);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },
);

router.post("/compartments", auth, authorize(["storage"]), async (req, res) => {
  try {
    const compartment = new Compartment({
      ...req.body,
      coldStorage: req.body.coldStorageId,
    });
    await compartment.save();
    res.status(201).send(compartment);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/inventory", auth, authorize(["customer"]), async (req, res) => {
  try {
    const compartment = await Compartment.findById(req.body.compartment);
    if (!compartment) {
      return res.status(404).send({ message: "Compartment not found" });
    }

    const inventory = new Inventory({
      ...req.body,
      customer: req.user._id,
      coldStorage: compartment.coldStorage,
    });

    compartment.currentInventory += req.body.quantity;
    await compartment.save();
    await inventory.save();

    res.status(201).send(inventory);
  } catch (e) {
    console.error("Error creating inventory:", e);
    res.status(400).send({ message: e.message });
  }
});

router.post("/cold-storage/nearby", auth, async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000 } = req.body;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .send({ error: "Latitude and longitude are required" });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const distance = parseInt(maxDistance);

    if (isNaN(lat) || isNaN(lng) || isNaN(distance)) {
      return res
        .status(400)
        .send({ error: "Invalid coordinate or distance values" });
    }

    const coldStorages = await ColdStorage.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: distance,
        },
      },
      isApproved: true,
    });

    res.send(coldStorages);
  } catch (e) {
    console.error("Error finding nearby cold storages:", e);
    res.status(400).send({ error: e.message });
  }
});

export default router;
