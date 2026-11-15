<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetPartnerLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        // Read saved language from session.
        $locale = $request->session()->get('partner_locale', 'en');

        // Allow only Greek and English.
        if (! in_array($locale, ['el', 'en'], true)) {
            $locale = 'en';
        }

        // Apply selected language.
        app()->setLocale($locale);

        return $next($request);
    }
}
