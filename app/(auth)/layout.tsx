// Das ist ein nestet Layout für sign-in und sign-up.
//  Hier wollen wir weder Navbar noch Footer zeigen.
// Wenn wir für eine Route Gruppe ein Layout haben, müssen wir die dazugehörigen Pages hier auch exportieren. Sonst Error.

import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      {children}
    </main>
  );
};

export default Layout;
