


import React, { createContext, useContext, useReducer, useEffect, useMemo, useRef } from 'react';
import { AppState, Event, Settings, User, Category, Language, Theme, AppView, Comment, Notification, Action, NotificationMessage, Permissions, ActivityLog, Toast } from '../types';
import { USERS, CATEGORIES, INITIAL_EVENTS, RECURRING_EVENT_TEMPLATES, INITIAL_COMMENTS } from '../constants';

// I18N Translations
const translations = {
  en: {
    'app.title': 'Guild Schedule Planner',
    'header.newEvent': 'New Event',
    'header.switchUser': 'Switch User',
    'nav.calendar': 'Calendar',
    'nav.favorites': 'Favorites',
    'nav.settings': 'Settings',
    'nav.guide': 'Guide',
    'nav.profile': 'Profile',
    'nav.activityLog': 'Activity Log',
    'guide.title': 'How to Use the Planner',
    'guide.section1.title': '1. Basic Calendar Functions',
    'guide.section1.content': 'You can switch between Month, Week, and List views using the toggles at the top right. Use the arrow buttons to navigate between months/weeks, and click "Today" to return to the current date.',
    'guide.section2.title': '2. Posting and Editing Events',
    'guide.section2.content': 'Click the "New Event" button to open the event creation form. Fill in the required fields and click "Create Event". To edit an existing event, simply click on it in the calendar. You can also delete events from the edit form.',
    'guide.section3.title': '3. Customization',
    'guide.section3.content': 'Switch between light and dark modes using the sun/moon icon in the header. Administrators can set a custom background image for the whole guild in the Settings page.',
    'guide.section4.title': '4. For Administrators',
    'guide.section4.content': 'Users with administrative rights have access to the Settings page where they can manage application-wide settings. Permissions to manage users, categories, or settings can be granted individually by a user with User Management permissions.',
    'guide.section5.title': '5. Communicating with Comments',
    'guide.section5.content': 'You can leave comments on any event to ask questions or coordinate with other members. This feature can be enabled or disabled by an administrator in the settings.',
    'guide.section6.title': '6. Recurring Events',
    'guide.section6.content': 'You can create recurring events (e.g., every Tuesday and Thursday) using the "Repeat" option in the event form. When you edit a recurring event, you will be asked whether to change just that one instance or the entire series.',
    'guide.section7.title': '7. Data Management (for Admins)',
    'guide.section7.content': 'Administrators with "Manage App Settings" permission can export and import data. A "Full Backup" saves everything (users, events, settings) and is useful for personal backups. A "Design & Settings Pack" saves only the theme and category configurations, making it safe to share your app\'s look and feel with other groups.',
    'guide.section8.title': '8. Activity Log (for Admins)',
    'guide.section8.content': 'Administrators with "Manage App Settings" permission can view a full history of all significant actions taken in the app, such as creating events, updating settings, or editing users. This provides transparency and helps track changes.',
    'guide.section9.title': '9. Initialization (for Admins)',
    'guide.section9.content': 'In the "Initialization / Reset" section of the settings, administrators with app settings permissions can perform dangerous actions. You can clear the entire activity log without affecting other data, or perform a full factory reset, which deletes ALL users, events, and settings, returning the app to its original state. Use these features with extreme caution.',
    'profile.title': 'User Profile',
    'profile.section.title': 'Profile Information',
    'profile.name': 'Name',
    'profile.avatarUrl': 'Avatar URL',
    'profile.role': 'Role',
    'profile.save': 'Save Changes',
    'profile.saved.success': 'Profile updated successfully!',
    'profile.upload.avatar': 'Upload Avatar',
    'settings.title': 'Application Settings',
    'settings.generalSettings': 'General Settings',
    'settings.calendarSettings': 'Calendar Settings',
    'settings.appName': 'Calendar Name',
    'settings.appName.placeholder': 'e.g., My Guild Planner',
    'settings.appName.description': 'The name displayed in the header and sidebar.',
    'settings.appIcon': 'Calendar Icon',
    'settings.appIcon.upload': 'Upload Icon',
    'settings.appIcon.description': 'A custom icon for your calendar (e.g., guild emblem). Recommended size: 128x128.',
    'settings.appearance': 'Appearance',
    'settings.backgroundUrl': 'Custom Background URL',
    'settings.backgroundUrl.placeholder': 'e.g., https://example.com/background.jpg',
    'settings.backgroundUrl.description': 'Set a custom background image for the entire app. Leave empty for no background.',
    'settings.features': 'Features',
    'settings.enableComments': 'Enable Comments',
    'settings.enableComments.description': 'Allow users to comment on events.',
    'settings.enableNotifications': 'Enable Notifications',
    'settings.enableNotifications.description': 'Send notifications for new events and reminders.',
    'settings.save': 'Save Settings',
    'settings.saved.success': 'Settings saved!',
    'settings.categoryManagement': 'Category Management',
    'settings.categoryManagement.description': 'Add, edit, or delete event categories.',
    'settings.category.add': 'Add New Category',
    'settings.category.inUse': 'This category is in use and cannot be deleted.',
    'settings.category.delete.confirm': 'Are you sure you want to delete this category?',
    'settings.userManagement': 'User Management',
    'settings.userManagement.description': 'Add, edit, or remove users.',
    'settings.user.add': 'Add New User',
    'settings.user.delete.confirm': 'Are you sure you want to delete this user?',
    'settings.user.delete.lastAdmin': 'Cannot delete the last administrator.',
    'settings.user.delete.self': 'You cannot delete yourself.',
    'settings.dataManagement': 'Data Management',
    'settings.dataManagement.description': 'Export application data for backup, or import a previously saved state.',
    'settings.data.fullBackup': 'Full Backup',
    'settings.data.fullBackup.description': 'Save or load all users, events, comments, and settings. Useful for migrating to a new browser.',
    'settings.data.exportAll': 'Export All Data',
    'settings.data.importAll': 'Import All Data',
    'settings.data.import.confirm': 'This will overwrite all current data. Are you sure you want to continue?',
    'settings.data.designPack': 'Design & Settings Pack',
    'settings.data.designPack.description': 'Share your visual settings and categories with other groups. This does not include any user or event data.',
    'settings.data.designPack.export': 'Export Design Pack',
    'settings.data.designPack.import': 'Import Design Pack',
    'settings.data.designPack.import.confirm': 'This will overwrite your current appearance and category settings. Are you sure you want to continue?',
    'settings.initialization': 'Initialization / Reset',
    'settings.initialization.description': 'Perform dangerous actions like clearing logs or resetting the entire application to its default state. These actions cannot be undone.',
    'settings.initialization.clearLog': 'Clear Activity Log',
    'settings.initialization.clearLog.description': 'This will permanently delete all recorded activity logs. Other data will not be affected.',
    'settings.initialization.clearLog.button': 'Clear Log',
    'settings.initialization.clearLog.confirm': 'Are you sure you want to permanently delete all activity logs?',
    'settings.initialization.resetApp': 'Reset Application',
    'settings.initialization.resetApp.description': 'This will delete ALL data (events, users, categories, settings) and restore the application to its factory default state. This is irreversible.',
    'settings.initialization.resetApp.button': 'Reset Application',
    'settings.initialization.resetApp.confirm': 'DANGER: Are you absolutely sure? This will delete all data permanently. Type "RESET" to confirm.',
    'favorites.title': 'Favorite Events',
    'favorites.empty': 'You have not added any events to your favorites yet. Click the star icon on an event to add it.',
    'event.modal.add.title': 'Add New Event',
    'event.modal.edit.title': 'Edit Event',
    'event.title': 'Title',
    'event.category': 'Category',
    'event.start': 'Start Time',
    'event.end': 'End Time',
    'event.moreOptions': 'More Options',
    'event.description': 'Description',
    'event.image': 'Image',
    'event.uploadImage': 'Upload Image',
    'event.removeImage': 'Remove Image',
    'event.status': 'Status',
    'event.status.published': 'Published',
    'event.status.draft': 'Draft',
    'event.status.private': 'Private',
    'event.delete': 'Delete',
    'event.cancel': 'Cancel',
    'event.save': 'Save Changes',
    'event.create': 'Create Event',
    'event.author': 'Author',
    'event.repeat': 'Repeat Event',
    'event.repeat.days': 'On these days:',
    'crop.image.title': 'Crop Image',
    'crop.image.save': 'Save Crop',
    'filter.allCategories': 'All Categories',
    'filter.favorites': 'Favorites',
    'filter.title': 'Filters',
    'filter.categories': 'Categories',
    'event.favorite.add': 'Add to favorites',
    'event.favorite.remove': 'Remove from favorites',
    'event.comments.title': 'Comments',
    'event.comments.placeholder': 'Write a comment...',
    'event.comments.post': 'Post',
    'event.comments.delete.confirm': 'Are you sure you want to delete this comment?',
    'time.ago.justnow': 'just now',
    'time.ago.seconds': ' seconds ago',
    'time.ago.minute': 'a minute ago',
    'time.ago.minutes': ' minutes ago',
    'time.ago.hour': 'an hour ago',
    'time.ago.hours': ' hours ago',
    'time.ago.day': 'a day ago',
    'time.ago.days': ' days ago',
    'category.modal.add.title': 'Add Category',
    'category.modal.edit.title': 'Edit Category',
    'category.name': 'Category Name',
    'category.color': 'Color',
    'category.icon': 'Icon',
    'user.modal.add.title': 'Add User',
    'user.modal.edit.title': 'Edit User',
    'user.name': 'User Name',
    'user.avatar': 'Avatar',
    'user.uploadAvatar': 'Upload Avatar',
    'user.role': 'Role',
    'user.role.admin': 'Admin',
    'user.role.member': 'Member',
    'user.permissions': 'Permissions',
    'user.permissions.manageUsers': 'Manage Users',
    'user.permissions.manageCategories': 'Manage Categories',
    'user.permissions.manageSettings': 'Manage App Settings',
    'user.switch.title': 'Switch User',
    'recurring.confirm.title': 'Recurring Event',
    'recurring.confirm.update.message': 'Do you want to update just this event, or the entire series?',
    'recurring.confirm.delete.message': 'Do you want to delete just this event, or the entire series?',
    'recurring.confirm.single': 'This Event Only',
    'recurring.confirm.all': 'The Entire Series',
    'recurring.confirm.cancel': 'Cancel',
    'notifications.title': 'Notifications',
    'notifications.empty': 'No new notifications.',
    'notifications.markAllAsRead': 'Mark all as read',
    'notification.newEvent': '{authorName} created a new event: {eventName}',
    'notification.newComment': '{commenterName} commented on: {eventName}',
    'notification.reminder': 'Reminder: {eventName} starts in about an hour.',
    'log.empty': 'No activity has been recorded yet.',
    'log.createdEvent': 'created event',
    'log.updatedEvent': 'updated event',
    'log.deletedEvent': 'deleted event',
    'log.createdUser': 'created user',
    'log.updatedUser': 'updated user',
    'log.deletedUser': 'deleted user',
    'log.createdCategory': 'created category',
    'log.updatedCategory': 'updated category',
    'log.deletedCategory': 'deleted category',
    'log.updatedSettings': 'updated application settings',
    'share.title': 'Share Event',
    'share.copy': 'Copy to Clipboard',
    'share.copied': 'Copied!',
    'toast.categoryInUse': 'This category is in use and cannot be deleted.',
    'toast.lastAdmin': 'Cannot delete the last administrator.',
    'toast.deleteSelf': 'You cannot delete yourself.',
  },
  ja: {
    'app.title': 'ギルド予定プランナー',
    'header.newEvent': '新しい予定',
    'header.switchUser': 'ユーザーを切り替え',
    'nav.calendar': 'カレンダー',
    'nav.favorites': 'お気に入り',
    'nav.settings': '設定',
    'nav.guide': 'ガイド',
    'nav.profile': 'プロフィール',
    'nav.activityLog': 'アクティビティログ',
    'guide.title': 'プランナーの使い方',
    'guide.section1.title': '1. 基本的なカレンダー機能',
    'guide.section1.content': '右上のトグルを使って「月」「週」「リスト」表示を切り替えられます。矢印ボタンで月や週を移動し、「今日」ボタンで現在の日付に戻ります。',
    'guide.section2.title': '2. 予定の投稿と編集',
    'guide.section2.content': '「新しい予定」ボタンをクリックして、予定作成フォームを開きます。必須項目を入力して「予定を作成」をクリックしてください。既存の予定を編集するには、カレンダー上の予定をクリックします。編集フォームから予定を削除することもできます。',
    'guide.section3.title': '3. カスタマイズ',
    'guide.section3.content': 'ヘッダーの太陽/月のアイコンを使って、ライトモードとダークモードを切り替えられます。管理者は、設定ページでギルド全体のカスタム背景画像を設定できます。',
    'guide.section4.title': '4. 管理者向け',
    'guide.section4.content': '管理者権限を持つユーザーは、アプリケーション全体の設定を管理できる設定ページにアクセスできます。ユーザー管理権限を持つユーザーは、他のユーザーにユーザー管理、カテゴリ管理、アプリ設定の権限を個別に付与できます。',
    'guide.section5.title': '5. コメントでのコミュニケーション',
    'guide.section5.content': '各イベントにコメントを残して、質問したり他のメンバーと調整したりできます。この機能は、管理者が設定で有効/無効を切り替えることができます。',
    'guide.section6.title': '6. 繰り返しの予定',
    'guide.section6.content': '予定の作成・編集画面にある「予定を繰り返す」オプションを使うことで、毎週火曜日・木曜日などの定期的な予定を作成できます。定期的な予定を編集する際には、その日だけの変更か、シリーズ全体の変更かを選択できます。',
    'guide.section7.title': '7. データ管理（管理者向け）',
    'guide.section7.content': '「アプリ設定」の権限を持つ管理者は、データをエクスポートおよびインポートできます。「フルバックアップ」はすべて（ユーザー、予定、設定）を保存し、個人用のバックアップに役立ちます。「デザイン＆設定パック」はテーマとカテゴリの設定のみを保存するため、アプリの外観を他のグループと安全に共有できます。',
    'guide.section8.title': '8. アクティビティログ（管理者向け）',
    'guide.section8.content': '「アプリ設定」の権限を持つ管理者は、アプリ内で行われたすべての重要な操作（イベント作成、設定更新、ユーザー編集など）の完全な履歴を閲覧できます。これにより透明性が確保され、変更の追跡に役立ちます。',
    'guide.section9.title': '9. 初期化（管理者向け）',
    'guide.section9.content': '設定画面の「初期化・リセット」セクションでは、アプリ設定権限を持つ管理者が危険な操作を実行できます。他のデータに影響を与えずにアクティビティログ全体を消去したり、すべてのユーザー、予定、設定を削除してアプリを初期状態に戻す完全なリセットを行ったりできます。これらの機能は細心の注意を払って使用してください。',
    'profile.title': 'ユーザープロフィール',
    'profile.section.title': 'プロフィール情報',
    'profile.name': '名前',
    'profile.avatarUrl': 'アバターURL',
    'profile.role': '役割',
    'profile.save': '変更を保存',
    'profile.saved.success': 'プロフィールを更新しました！',
    'profile.upload.avatar': 'アバターをアップロード',
    'settings.title': 'アプリケーション設定',
    'settings.generalSettings': '一般設定',
    'settings.calendarSettings': 'カレンダー設定',
    'settings.appName': 'カレンダー名',
    'settings.appName.placeholder': '例：マイギルドプランナー',
    'settings.appName.description': 'ヘッダーやサイドバーに表示される名前です。',
    'settings.appIcon': 'カレンダーアイコン',
    'settings.appIcon.upload': 'アイコンをアップロード',
    'settings.appIcon.description': 'カレンダーのカスタムアイコン（ギルドエンブレムなど）。推奨サイズ：128x128px。',
    'settings.appearance': '外観',
    'settings.backgroundUrl': 'カスタム背景URL',
    'settings.backgroundUrl.placeholder': '例: https://example.com/background.jpg',
    'settings.backgroundUrl.description': 'アプリ全体の背景画像を設定します。空にすると背景は表示されません。',
    'settings.features': '機能',
    'settings.enableComments': 'コメントを有効にする',
    'settings.enableComments.description': 'ユーザーがイベントにコメントできるようにします。',
    'settings.enableNotifications': '通知を有効にする',
    'settings.enableNotifications.description': '新しいイベントやリマインダーの通知を送信します。',
    'settings.save': '設定を保存',
    'settings.saved.success': '設定を保存しました！',
    'settings.categoryManagement': 'カテゴリ管理',
    'settings.categoryManagement.description': 'イベントカテゴリの追加、編集、削除を行います。',
    'settings.category.add': '新しいカテゴリを追加',
    'settings.category.inUse': 'このカテゴリは使用中のため削除できません。',
    'settings.category.delete.confirm': 'このカテゴリを削除してもよろしいですか？',
    'settings.userManagement': 'ユーザー管理',
    'settings.userManagement.description': 'ユーザーの追加、編集、削除を行います。',
    'settings.user.add': '新しいユーザーを追加',
    'settings.user.delete.confirm': 'このユーザーを削除してもよろしいですか？',
    'settings.user.delete.lastAdmin': '最後の管理者は削除できません。',
    'settings.user.delete.self': '自分自身を削除することはできません。',
    'settings.dataManagement': 'データ管理',
    'settings.dataManagement.description': 'アプリケーションのデータをバックアップとしてエクスポートしたり、以前に保存した状態をインポートしたりします。',
    'settings.data.fullBackup': 'フルバックアップ',
    'settings.data.fullBackup.description': 'すべてのユーザー、予定、コメント、設定を保存または読み込みます。新しいブラウザへの移行に便利です。',
    'settings.data.exportAll': '全データをエクスポート',
    'settings.data.importAll': '全データをインポート',
    'settings.data.import.confirm': '現在のすべてのデータが上書きされます。続行してもよろしいですか？',
    'settings.data.designPack': 'デザイン＆設定パック',
    'settings.data.designPack.description': '外観設定とカテゴリを他のグループと共有します。これにはユーザーや予定のデータは含まれません。',
    'settings.data.designPack.export': 'デザインパックをエクスポート',
    'settings.data.designPack.import': 'デザインパックをインポート',
    'settings.data.designPack.import.confirm': '現在の外観とカテゴリ設定が上書きされます。続行してもよろしいですか？',
    'settings.initialization': '初期化・リセット',
    'settings.initialization.description': 'アクティビティログの消去や、アプリケーション全体を初期状態に戻すなどの危険な操作を実行します。これらの操作は元に戻せません。',
    'settings.initialization.clearLog': 'アクティビティログを消去',
    'settings.initialization.clearLog.description': '記録されているすべてのアクティビティログを完全に削除します。他のデータには影響しません。',
    'settings.initialization.clearLog.button': 'ログを消去',
    'settings.initialization.clearLog.confirm': 'すべてのアクティビティログを完全に削除してもよろしいですか？',
    'settings.initialization.resetApp': 'アプリケーションをリセット',
    'settings.initialization.resetApp.description': 'すべてのデータ（予定、ユーザー、カテゴリ、設定）を削除し、アプリケーションを出荷時のデフォルト状態に戻します。この操作は元に戻せません。',
    'settings.initialization.resetApp.button': 'アプリケーションをリセット',
    'settings.initialization.resetApp.confirm': '危険：本当によろしいですか？すべてのデータが完全に削除されます。確認のために「RESET」と入力してください。',
    'favorites.title': 'お気に入りの予定',
    'favorites.empty': 'まだお気に入りに登録された予定がありません。イベントの星アイコンをクリックして追加してください。',
    'event.modal.add.title': '新しい予定を追加',
    'event.modal.edit.title': '予定を編集',
    'event.title': 'タイトル',
    'event.category': 'カテゴリ',
    'event.start': '開始時間',
    'event.end': '終了時間',
    'event.moreOptions': '追加オプション',
    'event.description': '説明',
    'event.image': '画像',
    'event.uploadImage': '画像をアップロード',
    'event.removeImage': '画像を削除',
    'event.status': 'ステータス',
    'event.status.published': '公開',
    'event.status.draft': '下書き',
    'event.status.private': '非公開',
    'event.delete': '削除',
    'event.cancel': 'キャンセル',
    'event.save': '変更を保存',
    'event.create': '予定を作成',
    'event.author': '作成者',
    'event.repeat': '予定を繰り返す',
    'event.repeat.days': '繰り返す曜日:',
    'crop.image.title': '画像を切り抜く',
    'crop.image.save': '切り抜きを保存',
    'filter.allCategories': 'すべてのカテゴリ',
    'filter.favorites': 'お気に入り',
    'filter.title': 'フィルター',
    'filter.categories': 'カテゴリ',
    'event.favorite.add': 'お気に入りに追加',
    'event.favorite.remove': 'お気に入りから削除',
    'event.comments.title': 'コメント',
    'event.comments.placeholder': 'コメントを書く...',
    'event.comments.post': '投稿',
    'event.comments.delete.confirm': 'このコメントを削除してもよろしいですか？',
    'time.ago.justnow': 'たった今',
    'time.ago.seconds': '秒前',
    'time.ago.minute': '1分前',
    'time.ago.minutes': '分前',
    'time.ago.hour': '1時間前',
    'time.ago.hours': '時間前',
    'time.ago.day': '1日前',
    'time.ago.days': '日前',
    'category.modal.add.title': 'カテゴリを追加',
    'category.modal.edit.title': 'カテゴリを編集',
    'category.name': 'カテゴリ名',
    'category.color': '色',
    'category.icon': 'アイコン',
    'user.modal.add.title': 'ユーザーを追加',
    'user.modal.edit.title': 'ユーザーを編集',
    'user.name': 'ユーザー名',
    'user.avatar': 'アバター',
    'user.uploadAvatar': 'アバターをアップロード',
    'user.role': '役割',
    'user.role.admin': '管理者',
    'user.role.member': 'メンバー',
    'user.permissions': '権限',
    'user.permissions.manageUsers': 'ユーザー管理',
    'user.permissions.manageCategories': 'カテゴリ管理',
    'user.permissions.manageSettings': 'アプリ設定',
    'user.switch.title': 'ユーザーを切り替え',
    'recurring.confirm.title': '繰り返しの予定',
    'recurring.confirm.update.message': 'この予定だけを変更しますか？ それとも今後の予定すべてを変更しますか？',
    'recurring.confirm.delete.message': 'この予定だけを削除しますか？ それとも今後の予定すべてを削除しますか？',
    'recurring.confirm.single': 'この予定のみ',
    'recurring.confirm.all': '今後のすべて',
    'recurring.confirm.cancel': 'キャンセル',
    'notifications.title': '通知',
    'notifications.empty': '新しい通知はありません。',
    'notifications.markAllAsRead': 'すべて既読にする',
    'notification.newEvent': '{authorName}が新しいイベントを作成しました: {eventName}',
    'notification.newComment': '{commenterName}がコメントしました: {eventName}',
    'notification.reminder': 'リマインダー: {eventName} は約1時間後に開始します。',
    'log.empty': 'アクティビティはまだ記録されていません。',
    'log.createdEvent': 'がイベントを作成しました:',
    'log.updatedEvent': 'がイベントを更新しました:',
    'log.deletedEvent': 'がイベントを削除しました:',
    'log.createdUser': 'がユーザーを作成しました:',
    'log.updatedUser': 'がユーザーを更新しました:',
    'log.deletedUser': 'がユーザーを削除しました:',
    'log.createdCategory': 'がカテゴリを作成しました:',
    'log.updatedCategory': 'がカテゴリを更新しました:',
    'log.deletedCategory': 'がカテゴリを削除しました:',
    'log.updatedSettings': 'がアプリケーション設定を更新しました',
    'share.title': 'イベントを共有',
    'share.copy': 'クリップボードにコピー',
    'share.copied': 'コピーしました！',
    'toast.categoryInUse': 'このカテゴリは使用中のため削除できません。',
    'toast.lastAdmin': '最後の管理者は削除できません。',
    'toast.deleteSelf': '自分自身を削除することはできません。',
  },
};

const toISOYMD = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().split('T')[0];
};

const appReducer = (state: AppState, action: Action): AppState => {
  const lang = state.settings.language;

  const createLogEntry = (actionType: string, details: { [key: string]: any }): ActivityLog => ({
      id: `log-${new Date().getTime()}`,
      timestamp: new Date(),
      userId: state.currentUser.id,
      action: actionType,
      details: details
  });

  switch (action.type) {
    case 'ADD_EVENT': {
      const newEvent = action.payload;
      const author = state.users.find(u => u.id === newEvent.authorId);
      const newNotifications: Notification[] = state.settings.enableNotifications
        ? state.users
          .filter(user => user.id !== newEvent.authorId)
          .map(user => ({
            id: `notif-${new Date().getTime()}-${user.id}`,
            userId: user.id,
            message: { type: 'new_event', authorName: author?.name || 'Someone', eventName: newEvent.title },
            eventId: newEvent.id,
            isRead: false,
            createdAt: new Date(),
          }))
        : [];
      const log = createLogEntry('CREATE_EVENT', { eventName: newEvent.title });
      return { 
          ...state, 
          events: [...state.events, newEvent],
          notifications: [...state.notifications, ...newNotifications],
          activityLog: [...state.activityLog, log]
      };
    }
    case 'UPDATE_EVENT': {
      const log = createLogEntry('UPDATE_EVENT', { eventName: action.payload.title });
      return {
        ...state,
        events: state.events.map((e) => (e.id === action.payload.id ? action.payload : e)),
        activityLog: [...state.activityLog, log]
      };
    }
    case 'DELETE_EVENT': {
      const { eventId, eventName } = action.payload;
      const log = createLogEntry('DELETE_EVENT', { eventName });
      return {
        ...state,
        events: state.events.filter((e) => e.id !== eventId),
        activityLog: [...state.activityLog, log]
      };
    }
    case 'UPDATE_RECURRING': {
      const { event, mode } = action.payload;
      const templateId = event.recurringEventId || event.id;
      const log = createLogEntry('UPDATE_EVENT', { eventName: event.title });
      if (mode === 'all') {
        return {
          ...state,
          events: state.events.map(e => e.id === templateId ? { ...e, ...event, id: templateId, isRecurring: true, recurringEventId: undefined } : e),
          activityLog: [...state.activityLog, log]
        };
      } else { // mode === 'single'
        const newEvent = { ...event, id: `event-${new Date().getTime()}`, isRecurring: false, recurringEventId: undefined, originalStart: undefined };
        return {
          ...state,
          events: [
            ...state.events.map(e => {
              if (e.id === templateId) {
                const exceptionDate = toISOYMD(new Date(event.originalStart || event.start));
                return { ...e, exceptionDates: [...(e.exceptionDates || []), exceptionDate] };
              }
              return e;
            }),
            newEvent,
          ],
          activityLog: [...state.activityLog, log]
        };
      }
    }
    case 'DELETE_RECURRING': {
      const { event, mode } = action.payload;
      const templateId = event.recurringEventId || event.id;
      const log = createLogEntry('DELETE_EVENT', { eventName: event.title });
      if (mode === 'all') {
        return { 
            ...state, 
            events: state.events.filter(e => e.id !== templateId),
            activityLog: [...state.activityLog, log]
        };
      } else { // mode === 'single'
        return {
          ...state,
          events: state.events.map(e => {
            if (e.id === templateId) {
              const exceptionDate = toISOYMD(new Date(event.originalStart || event.start));
              return { ...e, exceptionDates: [...(e.exceptionDates || []), exceptionDate] };
            }
            return e;
          }),
          activityLog: [...state.activityLog, log]
        };
      }
    }
    case 'UPDATE_SETTINGS':
        const log = createLogEntry('UPDATE_SETTINGS', {});
        return {
            ...state,
            settings: { ...state.settings, ...action.payload },
            activityLog: [...state.activityLog, log]
        };
    case 'SET_VIEW':
        return { ...state, currentView: action.payload };
    case 'TOGGLE_FAVORITE':
        const eventId = action.payload;
        const favorites = state.favorites.includes(eventId)
            ? state.favorites.filter(id => id !== eventId)
            : [...state.favorites, eventId];
        return { ...state, favorites };
    case 'UPDATE_CURRENT_USER':
        const updatedUser = { ...state.currentUser, ...action.payload };
        return {
            ...state,
            currentUser: updatedUser,
            users: state.users.map(u => u.id === updatedUser.id ? updatedUser : u),
        };
    case 'SET_CURRENT_USER': {
        const user = state.users.find(u => u.id === action.payload);
        return user ? { ...state, currentUser: user } : state;
    }
    case 'ADD_USER': {
        const newUser = action.payload;
        const log = createLogEntry('CREATE_USER', { userName: newUser.name });
        return { 
            ...state, 
            users: [...state.users, newUser],
            activityLog: [...state.activityLog, log]
        };
    }
    case 'UPDATE_USER': {
        const newlyUpdatedUser = action.payload;
        const log = createLogEntry('UPDATE_USER', { userName: newlyUpdatedUser.name });
        return {
            ...state,
            users: state.users.map(u => u.id === newlyUpdatedUser.id ? newlyUpdatedUser : u),
            currentUser: state.currentUser.id === newlyUpdatedUser.id ? newlyUpdatedUser : state.currentUser,
            activityLog: [...state.activityLog, log]
        };
    }
    case 'DELETE_USER': {
        const { userId, userName } = action.payload;
        if (userId === state.currentUser.id) {
            return {...state, toasts: [...state.toasts, {id: `toast-${Date.now()}`, message: translations[lang]['toast.deleteSelf'], type: 'error'}]}
        }
        const userToDelete = state.users.find(u => u.id === userId);
        const adminCount = state.users.filter(u => u.permissions.canManageUsers).length;

        if (userToDelete?.permissions.canManageUsers && adminCount <= 1) {
            return {...state, toasts: [...state.toasts, {id: `toast-${Date.now()}`, message: translations[lang]['toast.lastAdmin'], type: 'error'}]}
        }
        const log = createLogEntry('DELETE_USER', { userName });
        return { 
            ...state, 
            users: state.users.filter(u => u.id !== userId),
            activityLog: [...state.activityLog, log]
        };
    }
    case 'SET_CATEGORY_FILTER':
        return {
            ...state,
            activeCategoryFilter: action.payload,
        };
    case 'TOGGLE_FAVORITES_FILTER':
        return {
            ...state,
            isFavoritesFilterActive: !state.isFavoritesFilterActive,
        };
    case 'ADD_COMMENT': {
        const newComment = action.payload;
        if (!state.settings.enableComments) return state;

        const event = state.events.find(e => e.id === newComment.eventId || e.recurringEventId === newComment.eventId);
        if (!event) return { ...state, comments: [...state.comments, newComment] };

        const commenter = state.users.find(u => u.id === newComment.authorId);
        
        const usersToNotifyIds = new Set<string>();
        // Notify event author
        if (event.authorId !== newComment.authorId) {
            usersToNotifyIds.add(event.authorId);
        }
        // Notify other commenters
        state.comments
            .filter(c => (c.eventId === event.id || c.eventId === event.recurringEventId) && c.authorId !== newComment.authorId)
            .forEach(c => usersToNotifyIds.add(c.authorId));

        const newNotifications: Notification[] = state.settings.enableNotifications
            ? Array.from(usersToNotifyIds).map(userId => ({
                id: `notif-${new Date().getTime()}-${userId}`,
                userId: userId,
                message: { type: 'new_comment', commenterName: commenter?.name || 'Someone', eventName: event.title },
                eventId: event.id,
                isRead: false,
                createdAt: new Date(),
            }))
            : [];
        
        return { 
            ...state, 
            comments: [...state.comments, newComment],
            notifications: [...state.notifications, ...newNotifications]
        };
    }
    case 'DELETE_COMMENT':
      return {
        ...state,
        comments: state.comments.filter((c) => c.id !== action.payload),
      };
    case 'ADD_CATEGORY': {
        const newCategory = action.payload;
        const log = createLogEntry('CREATE_CATEGORY', { categoryName: newCategory.name });
        return { 
            ...state, 
            categories: [...state.categories, newCategory],
            activityLog: [...state.activityLog, log]
        };
    }
    case 'UPDATE_CATEGORY': {
        const updatedCategory = action.payload;
        const log = createLogEntry('UPDATE_CATEGORY', { categoryName: updatedCategory.name });
        return {
            ...state,
            categories: state.categories.map((c) => c.id === updatedCategory.id ? updatedCategory : c),
            activityLog: [...state.activityLog, log]
        };
    }
    case 'DELETE_CATEGORY': {
      const { categoryId, categoryName } = action.payload;
      if (state.events.some(e => e.categoryId === categoryId)) {
        return {...state, toasts: [...state.toasts, {id: `toast-${Date.now()}`, message: translations[lang]['toast.categoryInUse'], type: 'error'}]}
      }
      const log = createLogEntry('DELETE_CATEGORY', { categoryName });
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== categoryId),
        activityLog: [...state.activityLog, log]
      };
    }
    case 'ADD_NOTIFICATIONS':
        return {
            ...state,
            notifications: [...state.notifications, ...action.payload],
        };
    case 'MARK_NOTIFICATION_READ':
        return {
            ...state,
            notifications: state.notifications.map(n => n.id === action.payload ? { ...n, isRead: true } : n),
        };
    case 'MARK_ALL_NOTIFICATIONS_READ':
        return {
            ...state,
            notifications: state.notifications.map(n => n.userId === state.currentUser.id ? { ...n, isRead: true } : n),
        };
    case 'REPLACE_STATE':
        // Here we parse the dates again as JSON stringify/parse will lose the Date objects
        const newState = action.payload;
        const parseDates = (obj: any): any => {
            if (obj === null || typeof obj !== 'object') return obj;
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    if (['start', 'end', 'createdAt', 'originalStart', 'timestamp'].includes(key) && typeof obj[key] === 'string') {
                        obj[key] = new Date(obj[key]);
                    } else if (typeof obj[key] === 'object') {
                        parseDates(obj[key]);
                    }
                }
            }
            return obj;
        };
        return parseDates(newState);
    case 'IMPORT_DESIGN_SETTINGS':
        return {
            ...state,
            settings: action.payload.settings,
            categories: action.payload.categories,
            activityLog: [...state.activityLog, createLogEntry('UPDATE_SETTINGS', {})]
        };
    case 'CLEAR_ACTIVITY_LOG':
        return {
            ...state,
            activityLog: []
        };
    case 'RESET_APP_STATE':
        localStorage.removeItem('appState');
        return getInitialState();
    case 'ADD_TOAST':
      return {
          ...state,
          toasts: [...state.toasts, { ...action.payload, id: `toast-${Date.now()}` }],
      };
    case 'REMOVE_TOAST':
      return {
          ...state,
          toasts: state.toasts.filter(toast => toast.id !== action.payload),
      };
    default:
      return state;
  }
};

const defaultPermissions: Permissions = {
  canManageUsers: false,
  canManageCategories: false,
  canManageSettings: false,
};

export const getInitialState = (): AppState => {
  const initialEventsWithTemplates = [...INITIAL_EVENTS];
  RECURRING_EVENT_TEMPLATES.forEach(template => {
    initialEventsWithTemplates.push({
      ...template,
      id: `recurring-${template.title.replace(/\s+/g, '-')}`,
    } as Event);
  });
  
  return {
    users: USERS,
    currentUser: USERS[0],
    categories: CATEGORIES,
    events: initialEventsWithTemplates,
    comments: INITIAL_COMMENTS,
    notifications: [],
    settings: {
      theme: 'light' as Theme,
      backgroundUrl: '',
      enableComments: true,
      enableNotifications: true,
      language: 'ja' as Language,
      appName: 'Guild Schedule Planner',
      appIcon: '',
    },
    currentView: 'calendar' as AppView,
    favorites: [] as string[],
    activeCategoryFilter: null,
    isFavoritesFilterActive: false,
    activityLog: [],
    toasts: [],
  };
};


type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  t: (key: string) => string;
  generatedEvents: Event[];
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, getInitialState(), (init) => {
    try {
      const persistedState = localStorage.getItem('appState');
      if (!persistedState) return init;

      const loadedState = JSON.parse(persistedState, (key, value) => {
          if (['start', 'end', 'createdAt', 'originalStart', 'timestamp'].includes(key) && value) {
              return new Date(value);
          }
          return value;
      });
      
      // Data migration for users without permissions object
      const migratedUsers = (loadedState.users || init.users).map((user: User) => ({
        ...user,
        permissions: user.permissions || (user.role === 'admin' ? { canManageUsers: true, canManageCategories: true, canManageSettings: true } : defaultPermissions)
      }));

      const migratedState = {
        ...init,
        ...loadedState,
        users: migratedUsers,
        currentUser: migratedUsers.find((u: User) => u.id === loadedState.currentUser?.id) || migratedUsers[0],
        settings: { ...init.settings, ...loadedState.settings },
        events: loadedState.events || init.events,
        categories: loadedState.categories || init.categories,
        activityLog: loadedState.activityLog || init.activityLog,
        toasts: [], // Do not persist toasts
      }

      return migratedState;
    } catch {
      return init;
    }
  });

  const generatedEvents = useMemo(() => {
    const instances: Event[] = [];
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);

    const templates = state.events.filter(e => e.isRecurring);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        for (const template of templates) {
            if (template.recurringPattern?.days.includes(d.getDay())) {
                const exceptionDate = toISOYMD(d);
                if (template.exceptionDates?.includes(exceptionDate)) {
                    continue;
                }
                
                const originalStart = new Date(template.start);
                const originalEnd = new Date(template.end);
                
                const instanceStart = new Date(d);
                instanceStart.setHours(originalStart.getHours(), originalStart.getMinutes(), originalStart.getSeconds());

                const instanceEnd = new Date(d);
                instanceEnd.setHours(originalEnd.getHours(), originalEnd.getMinutes(), originalEnd.getSeconds());
                
                instances.push({
                    ...template,
                    id: `${template.id}_${exceptionDate}`,
                    start: instanceStart,
                    end: instanceEnd,
                    isRecurring: false, // The instance itself is not a template
                    recurringEventId: template.id,
                    originalStart: instanceStart,
                });
            }
        }
    }
    
    // Combine non-recurring events with generated instances
    const nonRecurringEvents = state.events.filter(e => !e.isRecurring);
    const allEvents = [...nonRecurringEvents, ...instances];

    // Filter events by status
    return allEvents.filter(event => {
        return event.status === 'published' || event.authorId === state.currentUser.id;
    });
  }, [state.events, state.currentUser.id]);

  const stateRef = useRef(state);
  stateRef.current = state;
  const generatedEventsRef = useRef(generatedEvents);
  generatedEventsRef.current = generatedEvents;

  useEffect(() => {
    if (!state.settings.enableNotifications) return;

    const intervalId = setInterval(() => {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        
        const currentGeneratedEvents = generatedEventsRef.current;
        const currentState = stateRef.current;
        const remindersToSend: Notification[] = [];
        
        currentGeneratedEvents.forEach(event => {
            if (event.start > now && event.start <= oneHourFromNow) {
                const reminderId = `notif-reminder-${event.id}-${event.authorId}`;
                const alreadyNotified = currentState.notifications.some(n => n.id === reminderId);
                
                if (!alreadyNotified && event.authorId === currentState.currentUser.id) {
                    remindersToSend.push({
                        id: reminderId,
                        userId: event.authorId,
                        message: { type: 'reminder', eventName: event.title },
                        eventId: event.id,
                        isRead: false,
                        createdAt: new Date(),
                    });
                }
            }
        });
        
        if (remindersToSend.length > 0) {
            dispatch({ type: 'ADD_NOTIFICATIONS', payload: remindersToSend });
        }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(intervalId);
  }, [state.settings.enableNotifications, state.currentUser.id]);

  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(state));
    document.documentElement.lang = state.settings.language;
    if (state.settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const t = (key: string): string => {
    const langKey = key as keyof typeof translations.en;
    return translations[state.settings.language][langKey] || langKey;
  };

  const value = { state, dispatch, t, generatedEvents };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};