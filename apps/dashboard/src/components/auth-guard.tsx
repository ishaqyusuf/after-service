import React from "react";

interface AuthGuardProps {
  rules?: any[];
  children: React.ReactNode;
}

export function AuthGuard({ rules, children }: AuthGuardProps) {
  // rules={[_perm.is(""),_role.is("")]}
  // TODO: Implement actual permission checking logic via tRPC/Auth context
  return <>{children}</>;
}
