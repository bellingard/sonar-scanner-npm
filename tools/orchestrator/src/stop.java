/*
 * sonar-scanner-npm
 * Copyright (C) 2011-2022 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import java.io.*;
import java.nio.*;
import java.nio.channels.*;

class stop {

  /**
   * Logic to stop SonarQube from Orchestrator
   * see {@link https://github.com/SonarSource/orchestrator/blob/ef6cbc63264cca3f2c73482f52bb435acaeacf3f/sonar-orchestrator/src/main/java/com/sonar/orchestrator/server/ServerProcessImpl.java#L145}
   *
   */
  public static void main(String[] args) throws Exception {
    try (RandomAccessFile sharedMemory = new RandomAccessFile(new File(args[0], "temp/sharedmemory"), "rw")) {
      // Using values from org.sonar.process.ProcessCommands
      MappedByteBuffer mappedByteBuffer = sharedMemory.getChannel().map(FileChannel.MapMode.READ_WRITE, 0, 50L * 10);

      // Now we are stopping all processes as quick as possible
      // by asking for stop of "app" process
      mappedByteBuffer.put(1, (byte) 0xFF);
    }
  }
} 
