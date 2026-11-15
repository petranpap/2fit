<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// EXISTING HOME PAGE
Route::get('/', function () {
    return view('welcome');
});

// 2FIT PARTNER LANGUAGE SWITCHER
Route::get('/partner/language/{locale}', function (
    Request $request,
    string $locale
) {
    // Only Greek and English are allowed.
    if (! in_array($locale, ['el', 'en'], true)) {
        abort(404);
    }

    // Save selected language.
    $request->session()->put('partner_locale', $locale);

    // Only allow local Partner Panel paths to avoid open redirects.
    $returnTo = (string) $request->query('return', '/partner');

    if (! preg_match('~^/partner(?:/|\?|$)~', $returnTo) || str_contains($returnTo, "\n")) {
        $returnTo = '/partner';
    }

    return redirect($returnTo);
})
    ->middleware('web')
    ->name('partner.language');
