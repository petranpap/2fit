<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\DiscountCodeResource\Pages;
use App\Models\DiscountCode;
use App\Models\Offer;
use App\Models\User;
use App\Services\OfferService;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
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
 * correct a code's status/expiry, or issue one directly (e.g. a goodwill
 * code for a customer complaint) rather than only ever via a claim (see
 * OfferService::claim()).
 */
class DiscountCodeResource extends Resource
{
    protected static ?string $model = DiscountCode::class;

    protected static ?string $navigationIcon = 'heroicon-o-qr-code';

    protected static ?string $navigationGroup = 'Commerce';

    public static function form(Form $form): Form
    {
        return $form->schema([
            // Only meaningful at creation — which offer/customer a code was
            // issued for isn't something you reassign afterwards.
            Select::make('offer_id')
                ->label('Offer')
                ->options(fn (): array => Offer::pluck('title', 'id')->all())
                ->searchable()
                ->required()
                ->hidden(fn (string $operation): bool => $operation === 'edit'),
            Select::make('user_id')
                ->label('Customer (optional)')
                ->options(fn (): array => User::where('role', 'user')
                    ->get()
                    ->mapWithKeys(fn (User $user): array => [$user->id => "{$user->name} ({$user->email})"])
                    ->all())
                ->searchable()
                ->hidden(fn (string $operation): bool => $operation === 'edit'),
            TextInput::make('code')
                ->required()
                ->maxLength(255)
                ->unique(ignoreRecord: true)
                ->default(fn () => app(OfferService::class)->generateUniqueCode())
                ->hidden(fn (string $operation): bool => $operation === 'edit'),
            Select::make('status')
                ->options([
                    'active' => 'Active',
                    'redeemed' => 'Redeemed',
                    'expired' => 'Expired',
                ])
                ->default('active')
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
            'create' => Pages\CreateDiscountCode::route('/create'),
            'edit' => Pages\EditDiscountCode::route('/{record}/edit'),
        ];
    }
}
