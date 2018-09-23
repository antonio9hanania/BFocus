package com.bfocus;

import android.app.Service;
import android.content.Intent;
import android.os.Bundle;
import android.os.IBinder;
import android.support.annotation.Nullable;

import com.bfocus.screenbridge.ScreenBridgeModule;

public class MyService extends Service {

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        System.out.println("onTaskRemoved called");
        super.onTaskRemoved(rootIntent);
        //do something you want

        Intent service = new Intent(getApplicationContext(), NotificationActionHandlerService.class);
        Bundle bundle = new Bundle();
        bundle.putString("foo", "bar");
        service.putExtras(bundle);
        getApplicationContext().startService(service);
        System.out.println("---> Send from service to the second service");
        //stop service
        this.stopSelf();
    }
}
