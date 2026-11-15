@php
    $current = app()->getLocale();
    $returnTo = request()->getRequestUri();
@endphp
<div style="display:flex;align-items:center;gap:12px;padding:8px;">
    <a href="{{ route('partner.language', ['locale' => 'el', 'return' => $returnTo]) }}"
       title="Ελληνικά" aria-label="Ελληνικά"
       style="font-size:22px;text-decoration:none;{{ $current === 'el' ? 'outline:2px solid #FFD600;border-radius:5px;' : 'opacity:0.65;' }}">🇬🇷 GR</a>
    <a href="{{ route('partner.language', ['locale' => 'en', 'return' => $returnTo]) }}"
       title="English" aria-label="English"
       style="font-size:22px;text-decoration:none;{{ $current === 'en' ? 'outline:2px solid #FFD600;border-radius:5px;' : 'opacity:0.65;' }}">🇬🇧 GB</a>
</div>
