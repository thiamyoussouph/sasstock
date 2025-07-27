'use client';

import { useEffect } from "react";

export default function ClientCleaner() {
  useEffect(() => {
    const body = document.body;
    body.removeAttribute('data-new-gr-c-s-check-loaded');
    body.removeAttribute('data-gr-ext-installed');
    body.removeAttribute('data-gramm');
    body.removeAttribute('data-gramm_id');
  }, []);

  return null;
}
