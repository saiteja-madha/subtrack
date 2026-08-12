const fs = require("node:fs");

const { IOSConfig, withFinalizedMod } = require("expo/config-plugins");

/**
 * SubTrack schedules notifications locally and does not register with APNs.
 * Removing this entitlement keeps local reminders available while allowing
 * development signing with a free Apple Personal Team.
 */
module.exports = function withLocalNotificationsOnly(config) {
  return withFinalizedMod(config, [
    "ios",
    (nextConfig) => {
      for (const entitlementsPath of IOSConfig.Paths.getAllEntitlementsPaths(
        nextConfig.modRequest.projectRoot,
      )) {
        const entitlements = fs.readFileSync(entitlementsPath, "utf8");
        const withoutApns = entitlements.replace(
          /\s*<key>aps-environment<\/key>\s*<string>[^<]*<\/string>/,
          "",
        );
        fs.writeFileSync(entitlementsPath, withoutApns);
      }
      return nextConfig;
    },
  ]);
};
