/**
 * OCI Auto Provisioner - OCI Service Module
 *
 * This module handles all interactions with Oracle Cloud Infrastructure API.
 * For actual implementation, install and use the OCI SDK:
 *
 * npm install oci-sdk
 *
 * Configuration:
 * - Credentials: OCI_PRIVATE_KEY_PATH, OCI_FINGERPRINT, OCI_TENANCY_OCID, OCI_USER_OCID
 * - Region: OCI_REGION
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// TODO: Import OCI SDK when ready
// import * as oci from 'oci-sdk';

export interface CreateInstanceParams {
  displayName: string;
  availabilityDomain: string;
  compartmentId: string;
  imageId: string;
  shape: string;
  subnetId: string;
  requestId: string;
  retryToken: string;
}

export interface Instance {
  id: string;
  displayName: string;
  lifecycleState: string;
  primaryPublicIp?: string;
}

export class OCIService {
  private isConfigured = false;

  constructor() {
    this.validateConfiguration();
  }

  private validateConfiguration(): void {
    const requiredVars = [
      "OCI_TENANCY_OCID",
      "OCI_USER_OCID",
      "OCI_FINGERPRINT",
      "OCI_PRIVATE_KEY_PATH",
      "OCI_REGION",
    ];

    const missing = requiredVars.filter((v) => !process.env[v]);

    if (missing.length > 0) {
      console.warn(
        "⚠️  OCI Service: Missing configuration:",
        missing.join(", ")
      );
      console.warn(
        "   The service will use simulated mode for development/testing"
      );
      this.isConfigured = false;
    } else {
      console.log("✅ OCI Service: Configuration detected");
      this.isConfigured = true;
      // TODO: Initialize OCI SDK client
      // this.initializeOCIClient();
    }
  }

  /**
   * Create an instance in OCI
   *
   * @param params Instance creation parameters
   * @returns Instance details or null if failed
   */
  async createInstance(params: CreateInstanceParams): Promise<Instance | null> {
    try {
      if (!this.isConfigured) {
        return this.simulateInstanceCreation(params);
      }

      // TODO: Implement actual OCI SDK call
      // const response = await this.client.compute.launchInstance({
      //   launchInstanceDetails: {
      //     displayName: params.displayName,
      //     availabilityDomain: params.availabilityDomain,
      //     compartmentId: params.compartmentId,
      //     sourceDetails: {
      //       sourceType: 'image',
      //       imageId: params.imageId,
      //     },
      //     shape: params.shape,
      //     createVnicDetails: {
      //       subnetId: params.subnetId,
      //     },
      //   },
      //   opcRetryToken: params.retryToken,
      //   opcRequestId: params.requestId,
      // });
      //
      // return response.instance;

      return this.simulateInstanceCreation(params);
    } catch (error) {
      console.error("Error creating instance in OCI:", error);
      throw error;
    }
  }

  /**
   * Get instance details
   *
   * @param instanceId OCI instance ID
   * @returns Instance details
   */
  async getInstance(instanceId: string): Promise<Instance | null> {
    try {
      if (!this.isConfigured) {
        return this.simulateGetInstance(instanceId);
      }

      // TODO: Implement actual OCI SDK call
      // const response = await this.client.compute.getInstance({
      //   instanceId: instanceId,
      // });
      //
      // return response.instance;

      return this.simulateGetInstance(instanceId);
    } catch (error) {
      console.error("Error getting instance from OCI:", error);
      return null;
    }
  }

  /**
   * List instances
   *
   * @param compartmentId Compartment ID to list from
   * @returns Array of instances
   */
  async listInstances(compartmentId: string): Promise<Instance[]> {
    try {
      if (!this.isConfigured) {
        return [];
      }

      // TODO: Implement actual OCI SDK call
      // const response = await this.client.compute.listInstances({
      //   compartmentId: compartmentId,
      // });
      //
      // return response.items || [];

      return [];
    } catch (error) {
      console.error("Error listing instances from OCI:", error);
      return [];
    }
  }

  /**
   * Terminate an instance
   *
   * @param instanceId OCI instance ID
   * @returns Success status
   */
  async terminateInstance(instanceId: string): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        return true; // Simulated success
      }

      // TODO: Implement actual OCI SDK call
      // await this.client.compute.terminateInstance({
      //   instanceId: instanceId,
      // });

      return true;
    } catch (error) {
      console.error("Error terminating instance in OCI:", error);
      return false;
    }
  }

  /**
   * Get instance action (start, stop, reboot)
   *
   * @param instanceId OCI instance ID
   * @param action Action to perform
   * @returns Success status
   */
  async instanceAction(
    instanceId: string,
    action: "START" | "STOP" | "RESET"
  ): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        return true; // Simulated success
      }

      // TODO: Implement actual OCI SDK call
      // await this.client.compute.instanceAction({
      //   instanceId: instanceId,
      //   action: action,
      // });

      return true;
    } catch (error) {
      console.error("Error performing action on instance in OCI:", error);
      return false;
    }
  }

  /**
   * Check if account has capacity in the target region/AD
   *
   * @param region OCI region
   * @param availabilityDomain Availability domain
   * @returns True if capacity available
   */
  async checkCapacity(
    region: string,
    availabilityDomain: string
  ): Promise<boolean> {
    try {
      // TODO: Implement quota checking
      // For now, always return true
      return true;
    } catch (error) {
      console.error("Error checking capacity:", error);
      return false;
    }
  }

  // ========== Simulation Methods (for testing/dev) ==========

  private simulateInstanceCreation(params: CreateInstanceParams): Instance {
    return {
      id: `ocid1.instance.oc1.${Date.now()}`,
      displayName: params.displayName,
      lifecycleState: "PROVISIONING",
      primaryPublicIp: this.generateMockIP(),
    };
  }

  private simulateGetInstance(instanceId: string): Instance {
    return {
      id: instanceId,
      displayName: `instance-${instanceId.substring(0, 8)}`,
      lifecycleState: "RUNNING",
      primaryPublicIp: this.generateMockIP(),
    };
  }

  private generateMockIP(): string {
    return `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  /**
   * Get service health status
   *
   * @returns Health status
   */
  getStatus(): {
    configured: boolean;
    mode: string;
    region?: string;
  } {
    return {
      configured: this.isConfigured,
      mode: this.isConfigured ? "production" : "simulation",
      region: process.env.OCI_REGION,
    };
  }
}

// Export singleton instance
export const ociService = new OCIService();
