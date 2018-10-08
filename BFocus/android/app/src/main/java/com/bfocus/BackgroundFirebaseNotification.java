package com.bfocus;


import android.content.Intent;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

import javax.annotation.Nullable;

public class BackgroundFirebaseNotification extends HeadlessJsTaskService {
    @Nullable
    @Override
    protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        System.out.println("---> Sending service");
        return new HeadlessJsTaskConfig("FireBaseCustomNotification", Arguments.fromBundle(intent.getExtras()), 5000, true);
    }
}

