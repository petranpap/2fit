<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use Illuminate\Http\Request;

trait AuthorizesListingOwnership
{
    /**
     * Only the listing's owner or an admin may modify it (e.g. upload media).
     */
    private function authorizeOwner(Request $request, Gym|Trainer|Shop $listing): void
    {
        $user = $request->user();

        abort_unless(
            $listing->user_id === $user->id || $user->role === 'admin',
            403,
            'You do not own this listing.'
        );
    }
}
