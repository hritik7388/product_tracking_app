import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const options = {
  collection: "vehicle",
  timestamps: true,
};

const vehicleSchema = new Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ["electric_bike", "car", "scooter"],
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    batteryLevel: {
      type: Number,
      default: 100,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        index: "2dsphere",
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
  },
  options
);

vehicleSchema.plugin(mongoosePaginate);
vehicleSchema.plugin(mongooseAggregatePaginate);

const vehicleModel = mongoose.model("vehicle", vehicleSchema);

// 🚲 Default Electric Vehicle Create
(async () => {
  try {
    const exist = await vehicleModel.findOne({ vehicleId: "EV001" });
    if (exist) {
      console.log("Default Electric Vehicle already exists ⚡");
    } else {
      const createdVehicle = await vehicleModel.create({
        vehicleId: "EV001",
        vehicleType: "electric_bike",
        isAvailable: true,
        batteryLevel: 95,
        currentLocation: {
          type: "Point",
          coordinates: [77.3844399, 28.6095334], // ✅ Your coordinates
        },
        status: "active",
      });
      console.log("Default Electric Vehicle Created ⚡", createdVehicle);
    }
  } catch (error) {
    console.error("Error creating default vehicle ⚠️", error);
  }
})();

export default vehicleModel;
