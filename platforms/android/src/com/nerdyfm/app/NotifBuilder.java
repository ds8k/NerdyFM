package com.nerdyfm.app;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.util.Log;
import android.app.NotificationManager;

import java.lang.Exception;
import java.lang.reflect.Field;

/**
 * Created by hollisinman on 4/16/15.
 */
public class NotifBuilder extends BroadcastReceiver {

    private static final String TAG = ".NotifBuilder";
    private static String contentTitle = "";
    private static String contentText = "";
    private static String action = "";
    private static final int notificationID = 01000101;
    private static boolean playerState = false;
    private static boolean setAutoCancel = false;
    private static boolean setOngoing = true;

    @Override
    public void onReceive(Context c, Intent intent) {

        Log.i(TAG, "Running onReceive()");

        // Get Extras sent from Intent sent to this BroadcastReceiver
        Bundle extras = intent.getExtras();

        // Instantiate Notification and NotificationManager objects
        NotificationCompat.Builder mNotification = new NotificationCompat.Builder(c);
        NotificationManager mManager = (NotificationManager) c.getSystemService(c.NOTIFICATION_SERVICE);

        // This intent returns you to your MainActivity
        Intent home = new Intent(c, NerdyFM.class);
        PendingIntent pendingHome = PendingIntent.getActivity(c, 0, home, 0);

        // Create ACTION Intents
        Intent play = new Intent(c, NotifBuilder.class);
        play.putExtra("ACTION", "PLAY");
        PendingIntent pendingPlay = PendingIntent.getBroadcast(c, 0, play, PendingIntent.FLAG_UPDATE_CURRENT);

        Intent pause = new Intent(c, NotifBuilder.class);
        pause.putExtra("ACTION", "PAUSE");
        PendingIntent pendingPause = PendingIntent.getBroadcast(c, 0, pause, PendingIntent.FLAG_UPDATE_CURRENT);

        Intent next = new Intent(c, NotifBuilder.class);
        next.putExtra("ACTION", "NEXT");
        PendingIntent pendingNext = PendingIntent.getBroadcast(c, 0, next, PendingIntent.FLAG_UPDATE_CURRENT);

        Intent previous = new Intent(c, NotifBuilder.class);
        previous.putExtra("ACTION", "PREVIOUS");
        PendingIntent pendingPrevious = PendingIntent.getBroadcast(c, 0, previous, PendingIntent.FLAG_UPDATE_CURRENT);

        // Execute necessary code assuming we didn't get an empty intent
        if (!intent.getExtras().isEmpty()) {

            // Get our extras and assign them to local variables
            contentTitle = extras.getString("CONTENT_TITLE");
            contentText = extras.getString("CONTENT_TEXT");
            action = extras.getString("ACTION");
            playerState = extras.getBoolean("PLAYER_STATE");
            setAutoCancel = extras.getBoolean("SET_AUTO_CANCEL");
            setOngoing = extras.getBoolean("SET_ONGOING");

            // Respond to ACTION specified by Intent
            if (!action.equals(null)) {

                // Fire execute() method for various actions here
                switch (action) {
                    case "PLAY":
                        Log.i(TAG, "In play");

                        try {
                            mManager.cancel(notificationID);
                        } catch (Exception e) {
                            Log.e(TAG, e.toString());
                        }
                        mNotification.setContentTitle(contentTitle)
                                .setContentText(contentText)
                                .setSmallIcon(R.drawable.icon)
                                .setAutoCancel(setAutoCancel)
                                .setOngoing(setOngoing)
                                .addAction(R.drawable.ic_previous, "", pendingPrevious)
                                .addAction(R.drawable.ic_pause, "", pendingPause)
                                .addAction(R.drawable.ic_next, "", pendingNext);
                        mManager.notify(TAG, notificationID, mNotification.build());
                        break;

                    case "PAUSE":
                        Log.i(TAG, "In pause");

                        try {
                            mManager.cancel(notificationID);
                        } catch (Exception e) {
                            Log.e(TAG, e.toString());
                        }
                        mNotification.setContentTitle(contentTitle)
                                .setContentText(contentText)
                                .setAutoCancel(setAutoCancel)
                                .setOngoing(setOngoing)
                                .addAction(R.drawable.ic_previous, "", pendingPrevious)
                                .addAction(R.drawable.ic_play, "", pendingPlay)
                                .addAction(R.drawable.ic_next, "", pendingNext)
                                .setSmallIcon(R.drawable.icon);
                        mManager.notify(TAG, notificationID, mNotification.build());
                        break;

                    case "NEXT":
                        Log.i(TAG, "In next");

                        try {
                            mManager.cancel(notificationID);
                        } catch (Exception e) {
                            Log.e(TAG, e.toString());
                        }
                        mNotification.setContentTitle(contentTitle)
                                .setContentText(contentText)
                                .setSmallIcon(R.drawable.icon)
                                .setAutoCancel(setAutoCancel)
                                .setOngoing(setOngoing)
                                .addAction(R.drawable.ic_previous, "", pendingPrevious)
                                .addAction(R.drawable.ic_pause, "", pendingPause)
                                .addAction(R.drawable.ic_next, "", pendingNext);
                        mManager.notify(TAG, notificationID, mNotification.build());
                        break;

                    case "PREVIOUS":
                        Log.i(TAG, "In previous");

                        try {
                            mManager.cancel(notificationID);
                        } catch (Exception e) {
                            Log.e(TAG, e.toString());
                        }
                        mNotification.setContentTitle(contentTitle)
                                .setContentText(contentText)
                                .setSmallIcon(R.drawable.icon)
                                .setAutoCancel(setAutoCancel)
                                .setOngoing(setOngoing)
                                .addAction(R.drawable.ic_previous, "", pendingPrevious)
                                .addAction(R.drawable.ic_pause, "", pendingPause)
                                .addAction(R.drawable.ic_next, "", pendingNext);
                        mManager.notify(TAG, notificationID, mNotification.build());
                        break;

                }
            } else {
                Log.i(TAG, "Didn't find any extras in that intent");
            }
        }
    }
}
