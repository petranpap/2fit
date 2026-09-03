<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\DiscountCodeResource\Pages;
use App\Models\DiscountCode;
use App\Services\OfferService;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables\Actions\Action;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

/**
 * Admin's platform-wide view over every discount code (no user_id scoping,
 * unlike Partner's DiscountCodeResource) — support/oversight: manually
 * correct a code's status or expiry when a customer or partner disputes it.
 * Codes themselves are only ever created by a customer's claim (see
 * OfferService::claim()) — no create page here either.
 */
class DiscountCodeResource extends Resource
{
    protected static ?string $model = DiscountCode::class;

    protected static ?string $navigationIcon = 'heroicon-o-qr-code';

    protected static ?string $navigationGroup = 'Commerce';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Select::make('status')
                ->options([
                    'active' => 'Active',
                    'redeemed' => 'Redeemed',
                    'expired' => 'Expired',
                ])
                ->required(),
            DateTimePicker::make('expires_at'),
            DateTimePicker::make('redeemed_at'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('code')->searchable()->copyable(),
                TextColumn::make('offer.offerable_type')
                    ->label('Listing type')
                    ->formatStateUsing(fn (?string $state): string => $state ? class_basename($state) : '—')
                    ->badge(),
                TextColumn::make('offer.offerable.name')->label('Listing'),
                TextColumn::make('offer.title')->label('Offer'),
                TextColumn::make('user.name')->label('Customer')->placeholder('—'),
                TextColumn::make('status')->badge()->color(fn (string $state) => match ($state) {
                    'active' => 'success',
                    'redeemed' => 'gray',
                    'expired' => 'danger',
                }),
                TextColumn::make('expires_at')->dateTime()->placeholder('—'),
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

                            Notification::make()->title('Code redeemed')->success()->send();
                        } catch (ValidationException $e) {
                            Notification::make()
                                ->title(collect($e->errors())->flatten()->first())
                                ->danger()
                                ->send();
                        }
                    }),
                \Filament\Tables\Actions\EditAction::make(),
                \Filament\Tables\Actions\DeleteAction::make(),
            ]);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with(['offer.offerable', 'user']);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDiscountCodes::route('/'),
            'edit' => Pages\EditDiscountCode::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
