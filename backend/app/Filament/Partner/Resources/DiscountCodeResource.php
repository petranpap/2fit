<?php

namespace App\Filament\Partner\Resources;

use App\Filament\Partner\Resources\DiscountCodeResource\Pages;
use App\Models\DiscountCode;
use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use App\Services\OfferService;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables\Actions\Action;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

/**
 * Read-only from the partner's side, plus one real action: redeem a code a
 * customer presents in person. Codes themselves are only ever created by a
 * customer's claim (see OfferService::claim()) — no create/edit pages here.
 */
class DiscountCodeResource extends Resource
{
    protected static ?string $model = DiscountCode::class;

    protected static ?string $navigationIcon = 'heroicon-o-qr-code';

    protected static ?string $navigationLabel = 'Redeem Codes';

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('code')->searchable()->copyable(),
                TextColumn::make('offer.title')->label('Offer'),
                TextColumn::make('user.name')->label('Customer'),
                TextColumn::make('status')->badge()->color(fn (string $state) => match ($state) {
                    'active' => 'success',
                    'redeemed' => 'gray',
                    'expired' => 'danger',
                }),
                TextColumn::make('expires_at')->dateTime(),
            ])
            ->actions([
                Action::make('redeem')
                    ->label('Redeem')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (DiscountCode $record) => $record->status === 'active')
                    ->requiresConfirmation()
                    ->action(function (DiscountCode $record) {
                        try {
                            app(OfferService::class)->redeem($record);

                            Notification::make()
                                ->title('Code redeemed')
                                ->success()
                                ->send();
                        } catch (ValidationException $e) {
                            Notification::make()
                                ->title(collect($e->errors())->flatten()->first())
                                ->danger()
                                ->send();
                        }
                    }),
            ]);
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getEloquentQuery(): Builder
    {
        $userId = auth()->id();

        return parent::getEloquentQuery()
            ->with(['offer', 'user'])
            ->whereHas(
                'offer',
                fn (Builder $query) => $query->whereHasMorph(
                    'offerable',
                    [Gym::class, Trainer::class, Shop::class],
                    fn (Builder $q) => $q->where('user_id', $userId),
                ),
            );
    }

    public static function shouldRegisterNavigation(): bool
    {
        return in_array(auth()->user()?->role, ['gym_owner', 'trainer', 'shop'], true);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDiscountCodes::route('/'),
        ];
    }
}
