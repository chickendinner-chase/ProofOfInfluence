import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Settings,
  AlertCircle,
} from "lucide-react";

interface WalletInfo {
  connected: boolean;
  address?: string;
  balance?: string;
  network?: string;
  chainId?: string;
  error?: string;
}

interface ContractRoleStatus {
  address: string;
  [roleName: string]: string | boolean;
}

interface RolesStatus {
  [contractName: string]: ContractRoleStatus;
}

interface ConfigureRolesResponse {
  success: boolean;
  message: string;
  transactions?: Array<{
    contract: string;
    role: string;
    txHash: string;
  }>;
}

export default function AgentKitConfigPage() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  // Fetch wallet info
  const {
    data: walletInfo,
    isLoading: walletLoading,
    refetch: refetchWallet,
  } = useQuery<WalletInfo>({
    queryKey: ["/api/agentkit/wallet"],
    retry: false,
  });

  // Fetch roles status
  const {
    data: rolesStatus,
    isLoading: rolesLoading,
    refetch: refetchRoles,
  } = useQuery<RolesStatus>({
    queryKey: ["/api/agentkit/roles"],
    retry: false,
  });

  // Test connection mutation
  const testMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/agentkit/test");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agentkit/wallet"] });
    },
  });

  // Configure roles mutation
  const configureRolesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/agentkit/configure-roles");
      return res.json() as Promise<ConfigureRolesResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agentkit/roles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agentkit/wallet"] });
    },
  });

  const handleTestConnection = () => {
    testMutation.mutate();
  };

  const handleConfigureRoles = () => {
    if (confirm("This will grant required roles to the AgentKit wallet. Continue?")) {
      configureRolesMutation.mutate();
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRoleStatusIcon = (hasRole: boolean) => {
    if (hasRole) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <PageLayout>
      <Section>
        <div className="mb-6">
          <h1
            className={cn(
              "text-3xl font-bold mb-2",
              theme === "cyberpunk"
                ? "font-orbitron text-cyan-100"
                : "font-fredoka text-slate-900"
            )}
          >
            AgentKit Configuration
          </h1>
          <p className="text-sm opacity-70">
            Manage AgentKit wallet connection and contract permissions
          </p>
        </div>

        {/* Wallet Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              AgentKit Wallet Information
            </CardTitle>
            <CardDescription>
              Current AgentKit wallet status and network information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {walletLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading wallet information...</span>
              </div>
            ) : walletInfo?.connected ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <span className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Address:</span>
                  <span className="font-mono text-sm">
                    {walletInfo.address ? formatAddress(walletInfo.address) : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Network:</span>
                  <span className="text-sm">{walletInfo.network || "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Balance:</span>
                  <span className="text-sm">
                    {walletInfo.balance ? `${parseFloat(walletInfo.balance).toFixed(4)} ETH` : "N/A"}
                  </span>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchWallet()}
                    disabled={walletLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {walletInfo?.error || "Failed to connect to AgentKit wallet"}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Contract Roles Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Contract Permissions
            </CardTitle>
            <CardDescription>
              Role permissions for AgentKit wallet across all contracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rolesLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading roles...</span>
              </div>
            ) : rolesStatus ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>MINTER_ROLE</TableHead>
                      <TableHead>DEFAULT_ADMIN_ROLE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(rolesStatus).map(([contractName, contractStatus]) => (
                      <TableRow key={contractName}>
                        <TableCell className="font-medium">{contractName}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatAddress(contractStatus.address)}
                        </TableCell>
                        <TableCell>
                          {contractStatus.MINTER_ROLE !== undefined
                            ? getRoleStatusIcon(contractStatus.MINTER_ROLE as boolean)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {contractStatus.DEFAULT_ADMIN_ROLE !== undefined
                            ? getRoleStatusIcon(contractStatus.DEFAULT_ADMIN_ROLE as boolean)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No contract roles found</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Test Connection</CardTitle>
              <CardDescription>Verify AgentKit wallet connectivity</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleTestConnection}
                disabled={testMutation.isPending}
                className="w-full"
              >
                {testMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
              {testMutation.data && (
                <Alert className="mt-4">
                  <AlertDescription>
                    {testMutation.data.success
                      ? testMutation.data.message
                      : `Error: ${testMutation.data.message}`}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Grant Required Roles</CardTitle>
              <CardDescription>Automatically grant all required roles to AgentKit wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleConfigureRoles}
                disabled={configureRolesMutation.isPending}
                variant="default"
                className="w-full"
              >
                {configureRolesMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Configuring...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Grant Required Roles
                  </>
                )}
              </Button>
              {configureRolesMutation.data && (
                <Alert
                  variant={configureRolesMutation.data.success ? "default" : "destructive"}
                  className="mt-4"
                >
                  <AlertDescription>
                    {configureRolesMutation.data.success ? (
                      <div>
                        <p className="font-medium">{configureRolesMutation.data.message}</p>
                        {configureRolesMutation.data.transactions &&
                          configureRolesMutation.data.transactions.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium">Transactions:</p>
                              <ul className="text-xs list-disc list-inside mt-1">
                                {configureRolesMutation.data.transactions.map((tx, idx) => (
                                  <li key={idx}>
                                    {tx.contract} - {tx.role}: {formatAddress(tx.txHash)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    ) : (
                      `Error: ${configureRolesMutation.data.message}`
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </Section>
    </PageLayout>
  );
}
