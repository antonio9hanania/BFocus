package com.bfocus;

import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

public class BackgroundTask extends HeadlessJsTaskService {
    @javax.annotation.Nullable
    @Override
    protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        Bundle extras = intent.getExtras();
        if (extras != null) {
            System.out.println("---> Sending background service to the react");
            return new HeadlessJsTaskConfig("BackgroundTask", Arguments.fromBundle(intent.getExtras()), 5000, true);
        }
        return null;
    }
}