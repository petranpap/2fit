<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

/**
 * Full user management — create/edit/delete any account, including
 * granting/revoking admin access via the role field. Creating a
 * gym_owner/trainer/shop account here only creates the *login* — that
 * person still creates their actual listing themselves from the Partner
 * panel afterwards (same as any partner normally would).
 */
class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    public const ROLE_OPTIONS = [
        'user' => 'User',
        'gym_owner' => 'Gym Owner',
        'trainer' => 'Trainer',
        'shop' => 'Shop',
        'admin' => 'Admin',
    ];

    public static function form(Form $form): Form
    {
        return $form->schema([
            TextInput::make('name')
                ->required()
                ->maxLength(255),
            TextInput::make('email')
                ->email()
                ->required()
                ->maxLength(255)
                ->unique(ignoreRecord: true),
            TextInput::make('phone')
                ->tel()
                ->maxLength(30),
            Select::make('role')
                ->options(self::ROLE_OPTIONS)
                ->required(),
            TextInput::make('password')
                ->password()
                ->revealable()
                ->minLength(8)
                ->required(fn (string $operation): bool => $operation === 'create')
                ->dehydrated(fn (?string $state): bool => filled($state))
                ->helperText(fn (string $operation): ?string => $operation === 'edit' ? 'Leave blank to keep the current password.' : null),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('name')->searchable(),
                TextColumn::make('email')->searchable()->copyable(),
                TextColumn::make('role')->badge(),
                TextColumn::make('phone')->placeholder('—'),
                TextColumn::make('created_at')->label('Joined')->dateTime('d M Y')->sortable(),
            ])
            ->filters([
                SelectFilter::make('role')->options(self::ROLE_OPTIONS),
            ])
            ->actions([
                \Filament\Tables\Actions\EditAction::make(),
                \Filament\Tables\Actions\DeleteAction::make()
                    // Deleting a gym_owner/trainer/shop cascades to their
                    // listing (users.id -> gyms/trainers/shops.user_id is
                    // cascadeOnDelete) — and nobody should delete themselves
                    // out of the panel.
                    ->visible(fn (User $record): bool => $record->id !== auth()->id()),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
